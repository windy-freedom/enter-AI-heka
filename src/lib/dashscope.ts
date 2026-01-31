// 阿里云百炼 API 配置
const API_KEY = 'sk-1871a27e3c234ac2bc52c0470041c314';
const BASE_URL = 'https://dashscope.aliyuncs.com';

export async function generateGreeting(): Promise<string> {
  const response = await fetch(`${BASE_URL}/compatible-mode/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
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
    throw new Error(`生成失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateImage(greeting: string): Promise<string> {
  const prompt = `中国传统马年新春贺卡设计，喜庆的红色和金色配色，优雅的骏马剪影，祥云、红灯笼、烟花装饰，中国传统剪纸艺术风格，竖版海报，精致华丽`;

  // 创建图片生成任务
  const response = await fetch(`${BASE_URL}/api/v1/services/aigc/text2image/image-synthesis`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: {
        prompt: prompt,
      },
      parameters: {
        size: '720*1280',
        n: 1,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`图片生成失败: ${response.status}`);
  }

  const data = await response.json();
  const taskId = data.output.task_id;

  // 轮询查询任务状态
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    const statusResponse = await fetch(`${BASE_URL}/api/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    const statusData = await statusResponse.json();

    if (statusData.output?.task_status === 'SUCCEEDED') {
      return statusData.output.results[0].url;
    } else if (statusData.output?.task_status === 'FAILED') {
      throw new Error('图片生成失败');
    }
  }

  throw new Error('图片生成超时');
}
