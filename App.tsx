import React, { useState, useCallback, useRef } from 'react';
import { generatePlan } from './services/geminiService';
import PlanDisplay from './components/PlanDisplay';
import Loader from './components/Loader';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';


const App: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [audience, setAudience] = useState('');
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({ base64: base64String, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       const reader = new FileReader();
       reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({ base64: base64String, mimeType: file.type });
       };
       reader.readAsDataURL(file);
    }
  };

  const handleGeneratePlan = useCallback(async () => {
    if (!idea || !audience) {
      setError('Vui lòng nhập ý tưởng ứng dụng và đối tượng mục tiêu.');
      return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedPlan('');

    try {
      const plan = await generatePlan(idea, audience, image ?? undefined);
      setGeneratedPlan(plan);
    } catch (err) {
      setError('Đã có lỗi xảy ra khi tạo kế hoạch. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [idea, audience, image]);
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        handleGeneratePlan();
    }
  };

  const handleDownload = useCallback(() => {
    if (!generatedPlan) return;

    const parseLineToTextRuns = (line: string): TextRun[] => {
      const parts = line.split(/(\*\*.*?\*\*)/g).filter(p => p);
      return parts.map(part => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return new TextRun({ text: part.slice(2, -2), bold: true });
        }
        return new TextRun(part);
      });
    };

    const docChildren = generatedPlan.split('\n').reduce((acc: Paragraph[], line) => {
      line = line.trim();
      if (!line) return acc;

      if (line.startsWith('## ')) {
        acc.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun(line.substring(3))],
          spacing: { before: 240, after: 120 },
        }));
      } else if (line.startsWith('* ') || line.startsWith('- ')) {
        acc.push(new Paragraph({
          bullet: { level: 0 },
          children: parseLineToTextRuns(line.substring(2)),
          indent: { left: 720 },
          spacing: { after: 100 },
        }));
      } else {
        acc.push(new Paragraph({
          children: parseLineToTextRuns(line),
          spacing: { after: 120 },
        }));
      }
      return acc;
    }, []);
    
    const doc = new Document({
        sections: [{
            children: docChildren,
        }],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, 'ke-hoach-hanh-dong-no-code.docx');
    });
  }, [generatedPlan]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        
        <header className="text-center mb-10">
          <div className="inline-block bg-gradient-to-r from-sky-400 to-cyan-300 p-3 rounded-xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-1.414-1.414m15.556 15.556l-1.414-1.414M18.364 5.636l1.414-1.414M4.222 19.778l1.414-1.414M12 12a5 5 0 100-10 5 5 0 000 10z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400">
            AI No-Code Project Planner
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Biến ý tưởng của bạn thành một kế hoạch hành động no-code chi tiết với sức mạnh của AI.
          </p>
        </header>

        <main>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl shadow-slate-950/50">
            <div className="space-y-6">
              <div>
                <label htmlFor="app-idea" className="block text-sm font-medium text-slate-300 mb-2">
                  Ý tưởng ứng dụng của bạn
                </label>
                <textarea
                  id="app-idea"
                  rows={3}
                  className="w-full bg-slate-900/70 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-300 placeholder:text-slate-500"
                  placeholder="Ví dụ: một ứng dụng quản lý chi tiêu cá nhân"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
               <div>
                <label htmlFor="app-idea-image" className="block text-sm font-medium text-slate-300 mb-2">
                  Ảnh ý tưởng mẫu (tùy chọn)
                </label>
                {image ? (
                  <div className="relative group rounded-lg border-2 border-slate-600">
                    <img src={`data:${image.mimeType};base64,${image.base64}`} alt="Ý tưởng mẫu" className="w-full h-auto max-h-64 object-contain rounded-md" />
                    <button 
                      onClick={handleImageRemove} 
                      className="absolute top-2 right-2 bg-slate-900/70 backdrop-blur-sm hover:bg-slate-800 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                      aria-label="Gỡ ảnh"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex justify-center items-center w-full px-6 py-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-sky-500 bg-slate-800' : 'border-slate-600 hover:border-sky-500'}`}
                  >
                    <input 
                      ref={fileInputRef}
                      id="app-idea-image"
                      type="file" 
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                      className="hidden" 
                    />
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-slate-400">
                        <span className="font-semibold text-sky-400">Tải ảnh lên</span> hoặc kéo và thả
                      </p>
                      <p className="text-xs text-slate-500">PNG, JPG, WEBP</p>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="target-audience" className="block text-sm font-medium text-slate-300 mb-2">
                  Đối tượng mục tiêu
                </label>
                <input
                  id="target-audience"
                  type="text"
                  className="w-full bg-slate-900/70 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-300 placeholder:text-slate-500"
                  placeholder="Ví dụ: sinh viên và người mới đi làm"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            
            <div className="mt-8 text-center">
              <button
                onClick={handleGeneratePlan}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-600 hover:to-cyan-500 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo kế hoạch...
                  </>
                ) : (
                  'Tạo kế hoạch hành động'
                )}
              </button>
               <p className="text-xs text-slate-500 mt-2">Hoặc nhấn Ctrl/Cmd + Enter</p>
            </div>
          </div>

          {isLoading && !generatedPlan && (
            <div className="mt-10 flex flex-col items-center justify-center text-center">
              <Loader />
              <p className="mt-4 text-slate-400">AI đang phân tích yêu cầu của bạn. Vui lòng chờ trong giây lát...</p>
            </div>
          )}

          {generatedPlan && (
            <div className="mt-10 bg-slate-800/30 border border-slate-700 rounded-2xl shadow-lg">
               <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Kế Hoạch Hành Động No-Code</h2>
                    <button
                        onClick={handleDownload}
                        className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm rounded-lg transition-colors duration-200"
                        title="Tải về dưới dạng file Word"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Tải về (.docx)
                    </button>
                </div>
              <PlanDisplay planText={generatedPlan} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;