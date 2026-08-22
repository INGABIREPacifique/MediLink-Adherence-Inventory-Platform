// Supabase Edge Function: rank-escalation-priority
//
// Implements the ONE AI-assisted feature the proposal specifies for
// escalations (MediLink_Rwanda_Proposal.docx §4): "Missed-dose escalation
// priority -- AI-assisted prioritization. Ranks which non-responders need
// urgent human follow-up first, based on condition risk, dosage type, and
// history." The missed-dose TRIGGER itself stays rule-based (a timer in
// the app/DB) -- this function only ranks priority AFTER an escalation
// already exists, exactly as the proposal scopes it.
//
// Runs server-side so the Anthropic API key is never exposed to the
// frontend. Called via supabase.functions.invoke('rank-escalation-priority')
// with { escalation_id }.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.32.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

Deno.serve(async (req) => {
  try {
    const { escalation_id } = await req.json();
    if (!escalation_id) {
      return new Response(JSON.stringify({ error: 'escalation_id is required' }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // server-side only, never exposed to frontend
    );

    // Pull the escalation + patient's recent history for context.
    const { data: escalation, error: escError } = await supabase
      .from('escalations')
      .select('id, medication, phase, missed_at, patient_id, patients:patient_id ( name )')
      .eq('id', escalation_id)
      .single();
    if (escError || !escalation) {
      return new Response(JSON.stringify({ error: 'Escalation not found' }), { status: 404 });
    }

    const { count: priorEscalationCount } = await supabase
      .from('escalations')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', escalation.patient_id)
      .neq('id', escalation_id);

    const hoursSinceMissed = (Date.now() - new Date(escalation.missed_at).getTime()) / (1000 * 60 * 60);

    // Ask Claude to rank priority + give a one-sentence reason a nurse can
    // read in under 2 seconds, per the proposal's own framing ("ranks
    // which non-responders need urgent follow-up first").
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system:
        'You triage missed-medication-dose escalations for nurses at a Rwandan hospital\'s ' +
        'post-discharge adherence program. Given a case, respond with ONLY a JSON object: ' +
        '{"priority": "low"|"medium"|"high"|"critical", "reasoning": "one short sentence"}. ' +
        'No markdown, no preamble. Consider: medication/condition risk if a dose is missed ' +
        '(e.g. TB intensive-phase treatment is higher risk than a single missed painkiller dose), ' +
        'how long the dose has been missed, and whether this patient has a history of missed doses.',
      messages: [
        {
          role: 'user',
          content: `Medication: ${escalation.medication}\nTreatment phase: ${escalation.phase ?? 'unspecified'}\nHours since missed: ${hoursSinceMissed.toFixed(1)}\nPrior escalations for this patient: ${priorEscalationCount ?? 0}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const parsed = JSON.parse(textBlock && 'text' in textBlock ? textBlock.text : '{}');

    const { error: updateError } = await supabase
      .from('escalations')
      .update({ ai_priority: parsed.priority, ai_reasoning: parsed.reasoning })
      .eq('id', escalation_id);
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ priority: parsed.priority, reasoning: parsed.reasoning }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
