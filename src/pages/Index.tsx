import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Download, RefreshCw, Loader2, Image as ImageIcon, Key, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';
import { generateGreeting as apiGenerateGreeting, generateImage as apiGenerateImage } from '@/lib/dashscope';
import { toast } from 'sonner';

const API_KEY_STORAGE_KEY = 'dashscope_api_key';

export default function Index() {
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 从 localStorage 读取 API Key
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowKeyInput(true);
    }
  }, []);

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('请输入 API Key');
      return;
    }
    if (!apiKey.startsWith('sk-')) {
      toast.error('API Key 格式不正确，应以 sk- 开头');
      return;
    }
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
    setShowKeyInput(false);
    toast.success('API Key 已保存');
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey('');
    setShowKeyInput(true);
    setGreeting('');
    setImageUrl('');
    toast.success('API Key 已清除');
  };

  const generateGreeting = async () => {
    if (!apiKey) {
      setShowKeyInput(true);
      toast.error('请先配置 API Key');
      return;
    }

    setIsGenerating(true);
    setGreeting('');
    setImageUrl('');
    
    try {
      const greetingText = await apiGenerateGreeting(apiKey);
      setGreeting(greetingText);
      toast.success('贺词生成成功！');
    } catch (error) {
      console.error('Error:', error);
      toast.error('生成失败，请检查 API Key 是否正确');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!greeting) return;
    
    setIsGeneratingImage(true);
    
    try {
      const imageUrlResult = await apiGenerateImage(apiKey, greeting);
      setImageUrl(imageUrlResult);
      toast.success('图片生成成功！');
    } catch (error) {
      console.error('Error:', error);
      toast.error('图片生成失败，请稍后重试');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const copyGreeting = async () => {
    if (!greeting) return;
    
    try {
      await navigator.clipboard.writeText(greeting);
      toast.success('贺词已复制到剪贴板！');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `马年贺词_${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('图片下载中...');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <BackgroundDecorations />
      
      <main className="relative z-10 container max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* 头部标题 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              马年贺词
            </h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
            </motion.div>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground">
            2026 龙马精神 • 马到成功
          </p>
        </motion.div>

        {/* API Key 配置区 */}
        <AnimatePresence>
          {showKeyInput && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <Card className="p-6 bg-card/95 backdrop-blur border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Key className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">配置 API Key</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        请输入你的阿里云百炼平台 API Key，用于生成贺词和图片。
                        <a 
                          href="https://help.aliyun.com/zh/model-studio/getting-started/first-api-call-to-qwen" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline ml-1"
                        >
                          如何获取？
                        </a>
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="sk-xxxxxxxxxxxxxxxx"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveApiKey()}
                          className="flex-1"
                        />
                        <Button onClick={saveApiKey} variant="festive">
                          保存
                        </Button>
                      </div>
                      <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>
                          API Key 仅保存在你的浏览器本地，不会上传到任何服务器。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* API Key 状态显示 */}
        {!showKeyInput && apiKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex justify-end"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={clearApiKey}
              className="text-muted-foreground hover:text-foreground"
            >
              <Key className="w-4 h-4 mr-2" />
              更换 API Key
            </Button>
          </motion.div>
        )}

        {/* 主内容区 */}
        <div className="space-y-6">
          {/* 初始状态 - 生成按钮 */}
          {!greeting && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <Button
                variant="festive"
                size="xl"
                onClick={generateGreeting}
                className="w-full md:w-auto min-w-64 shadow-glow"
              >
                <Sparkles className="w-5 h-5" />
                生成马年贺词
              </Button>
            </motion.div>
          )}

          {/* 生成中状态 */}
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-12 h-12 text-primary" />
              </motion.div>
              <p className="mt-4 text-lg text-muted-foreground">正在生成贺词...</p>
            </motion.div>
          )}

          {/* 贺词展示 */}
          <AnimatePresence mode="wait">
            {greeting && (
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-6 md:p-8 bg-gradient-to-br from-card via-card/95 to-primary/5 border-primary/20 shadow-soft">
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute -top-4 -left-4 text-6xl text-primary/20 font-serif">"</div>
                      <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap text-center py-4 px-2">
                        {greeting}
                      </p>
                      <div className="absolute -bottom-4 -right-4 text-6xl text-primary/20 font-serif">"</div>
                    </div>

                    {/* 操作按钮组 */}
                    <div className="flex flex-wrap gap-3 justify-center pt-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={copyGreeting}
                        className="flex-1 min-w-[140px]"
                      >
                        <Copy className="w-4 h-4" />
                        复制贺词
                      </Button>
                      
                      <Button
                        variant="gold"
                        size="lg"
                        onClick={generateImage}
                        disabled={isGeneratingImage}
                        className="flex-1 min-w-[140px]"
                      >
                        {isGeneratingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4" />
                            生成图片
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={generateGreeting}
                        disabled={isGenerating}
                        className="flex-1 min-w-[140px]"
                      >
                        <RefreshCw className="w-4 h-4" />
                        重新生成
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 图片展示 */}
          <AnimatePresence>
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="p-4 md:p-6 bg-card/95 backdrop-blur border-primary/20 shadow-soft">
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden shadow-gold">
                      <img
                        src={imageUrl}
                        alt="马年贺词图片"
                        className="w-full h-auto"
                      />
                    </div>
                    
                    <Button
                      variant="festive"
                      size="lg"
                      onClick={downloadImage}
                      className="w-full"
                    >
                      <Download className="w-4 h-4" />
                      下载图片
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 底部说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-12 text-sm text-muted-foreground"
        >
          <p>祝您马年大吉 • 万事如意</p>
        </motion.div>
      </main>
    </div>
  );
}
