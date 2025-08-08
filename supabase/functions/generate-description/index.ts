import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sectionType, data } = await req.json()

    if (!sectionType || !data) {
      throw new Error('Section type and data are required')
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    let prompt = ''

    switch (sectionType) {
      case 'workExperience':
        prompt = `Generate a professional aviation industry job description for the following position:
        
Position: ${data.position || 'Aviation Professional'}
Company: ${data.company || 'Aviation Company'}
Start Date: ${data.startDate || 'N/A'}
End Date: ${data.endDate || 'Present'}

Please write a concise, professional description (2-3 sentences) highlighting key responsibilities and achievements in aviation operations. Focus on safety, compliance, teamwork, and technical skills relevant to the aviation industry.`
        break

      case 'aircraftExperience':
        prompt = `Generate a brief professional description for aviation aircraft experience:
        
Aircraft Model: ${data.aircraftModel || 'Aircraft'}
Hours Flown: ${data.hoursFlown || 'N/A'}
Type Rated: ${data.typeRated ? 'Yes' : 'No'}
Last Flown: ${data.lastFlown || 'N/A'}

Please write a short professional description (1-2 sentences) that would be suitable for an aviation resume, emphasizing proficiency and experience level.`
        break

      case 'training':
        prompt = `Generate a brief description for aviation training:
        
Training Name: ${data.trainingName || 'Aviation Training'}
Provider: ${data.provider || 'Training Provider'}
Completion Date: ${data.completionDate || 'N/A'}

Please write a concise description (1-2 sentences) highlighting the value and relevance of this training to aviation operations and safety.`
        break

      default:
        throw new Error('Unsupported section type')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert aviation industry resume writer. Generate professional, concise descriptions that highlight aviation expertise, safety focus, and industry-specific skills.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate description')
    }

    const result = await response.json()
    const generatedDescription = result.choices[0].message.content.trim()

    return new Response(
      JSON.stringify({ description: generatedDescription }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error generating description:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})