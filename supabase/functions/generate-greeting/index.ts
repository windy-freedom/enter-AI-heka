import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('DASHSCOPE_API_KEY');
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // 调用阿里云百炼 qwen3-max 生成贺词
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-max',
        messages: [
          {
            role: 'system',
            content: '你是一个擅长创作中国传统新春祝福语的专家。请生成简洁、押韵、吉祥的马年新春贺词。贺词要包含"马"的元素，体现新春祝福，4-8句为佳，每句字数相近。'
          },
          {
            role: 'user',
            content: '请为2026马年创作一段新春贺词，要求喜庆、吉祥、朗朗上口，适合长辈分享给亲友。'
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const greeting = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ greeting }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});