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
    const { greeting } = await req.json();
    
    console.log('Received greeting:', greeting);
    
    if (!greeting) {
      throw new Error('Greeting text is required');
    }

    const apiKey = Deno.env.get('DASHSCOPE_API_KEY');
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // 构建图片生成 prompt - 简化版，不包含贺词文字
    const prompt = `中国传统马年新春贺卡设计，喜庆的红色和金色配色，优雅的骏马剪影，祥云、红灯笼、烟花装饰，中国传统剪纸艺术风格，竖版海报，精致华丽`;

    console.log('Sending request to DashScope API');

    // 调用阿里云百炼 wanx-v1 生成图片
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: prompt,
        },
        parameters: {
          size: '720*1280',  // 9:16 比例 - wanx-v1 支持的尺寸
          n: 1,
        }
      }),
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data));
    
    // 处理异步任务
    if (data.output?.task_id) {
      const taskId = data.output.task_id;
      console.log('Task created:', taskId);
      
      // 轮询查询任务状态
      let attempts = 0;
      const maxAttempts = 50;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
        
        console.log(`Checking task status, attempt ${attempts + 1}`);
        
        const statusResponse = await fetch(
          `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );
        
        const statusData = await statusResponse.json();
        console.log('Task status:', statusData.output?.task_status);
        
        if (statusData.output?.task_status === 'SUCCEEDED') {
          const imageUrl = statusData.output.results[0].url;
          console.log('Image generated successfully:', imageUrl);
          return new Response(
            JSON.stringify({ imageUrl }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          );
        } else if (statusData.output?.task_status === 'FAILED') {
          const errorMessage = statusData.output?.message || JSON.stringify(statusData);
          console.error('Task failed:', errorMessage);
          throw new Error(`Image generation failed: ${errorMessage}`);
        }
        
        attempts++;
      }
      
      throw new Error('Image generation timeout after 150 seconds');
    }

    // 如果是同步返回
    if (data.output?.results?.[0]?.url) {
      const imageUrl = data.output.results[0].url;
      console.log('Image generated (sync):', imageUrl);
      return new Response(
        JSON.stringify({ imageUrl }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    throw new Error('Unexpected API response format: ' + JSON.stringify(data));

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});