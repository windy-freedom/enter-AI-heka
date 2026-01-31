import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Download, RefreshCw, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';
import { generateGreeting as apiGenerateGreeting, generateImage as apiGenerateImage } from '@/lib/dashscope';
import { toast } from 'sonner';

export default function Index() {
  const [greeting, setGreeting] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generateGreeting = async () => {
    setIsGenerating(true);
    setGreeting('');
    setImageUrl('');
    
    try {
      const greetingText = await apiGenerateGreeting();
      setGreeting(greetingText);
      toast.success('贺词生成成功！');
    } catch (error) {
      console.error('Error:', error);
      toast.error('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!greeting) return;
    
    setIsGeneratingImage(true);
    
    try {
      const imageUrlResult = await apiGenerateImage(greeting);
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
