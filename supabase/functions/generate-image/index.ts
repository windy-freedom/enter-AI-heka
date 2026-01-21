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
    
    if (!greeting) {
      throw new Error('Greeting text is required');
    }

    const apiKey = Deno.env.get('DASHSCOPE_API_KEY');
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // 构建图片生成 prompt - 使用中文
    const prompt = `中国传统2026马年新春贺卡设计：
主色调：喜庆的中国红和吉祥金色
核心元素：一匹优雅的骏马剪影或写意马的形象
装饰元素：祥云、红灯笼、烟花、梅花、福字
画面布局：竖版海报设计
艺术风格：中国传统剪纸艺术与现代插画相结合
氛围：喜庆、温暖、吉祥如意
画面精致华丽，适合手机分享
在画面上方或中心位置用优美的书法字体展示贺词："${greeting}"`;

    // 调用阿里云百炼 wanx2.1 生成图片
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model: 'wanx2.1',
        input: {
          prompt: prompt,
        },
        parameters: {
          size: '768*1344',  // 9:16 比例
          n: 1,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // 处理异步任务
    if (data.output?.task_id) {
      const taskId = data.output.task_id;
      
      // 轮询查询任务状态
      let attempts = 0;
      const maxAttempts = 40; // 最多等待40次（约80秒）
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
        
        const statusResponse = await fetch(
          `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
            },
          }
        );
        
        const statusData = await statusResponse.json();
        
        if (statusData.output?.task_status === 'SUCCEEDED') {
          const imageUrl = statusData.output.results[0].url;
          return new Response(
            JSON.stringify({ imageUrl }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          );
        } else if (statusData.output?.task_status === 'FAILED') {
          const errorMessage = statusData.output?.message || 'Image generation failed';
          console.error('Task failed:', errorMessage);
          throw new Error(errorMessage);
        }
        
        attempts++;
      }
      
      throw new Error('Image generation timeout');
    }

    // 如果是同步返回
    if (data.output?.results?.[0]?.url) {
      return new Response(
        JSON.stringify({ imageUrl: data.output.results[0].url }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    throw new Error('Unexpected API response format');

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