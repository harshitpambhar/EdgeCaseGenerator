import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCloudUpload, HiOutlineX, HiOutlineDocumentText } from 'react-icons/hi';

export default function UploadBox({ onFilesSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
    onFilesSelected?.(droppedFiles);
  }, [onFilesSelected]);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
    onFilesSelected?.(selectedFiles);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? '#22d3ee' : 'rgba(255, 255, 255, 0.05)',
          backgroundColor: isDragging ? 'rgba(34, 211, 238, 0.05)' : 'transparent',
        }}
        className="relative rounded-[2rem] border-2 border-dashed p-12 text-center cursor-pointer group transition-all duration-500"
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          accept=".zip,.tar,.gz,.py,.js,.ts,.java,.go,.rs,.cpp,.c,.rb"
        />
        <motion.div
          animate={{ scale: isDragging ? 1.05 : 1 }}
          className="flex flex-col items-center relative z-10"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/5 transition-all duration-500">
            <HiOutlineCloudUpload className="text-4xl text-cyan-400" />
          </div>
          <h4 className="text-lg font-black font-heading text-white uppercase tracking-tight mb-2">
            {isDragging ? 'Neural Link Ready' : 'Inject Source Archives'}
          </h4>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Drag & drop or establish connection manually</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {['.py', '.js', '.ts', '.zip', '.go', '.rs'].map(ext => (
              <span key={ext} className="text-[9px] font-black px-3 py-1 rounded-lg bg-[#050816] text-slate-400 border border-white/5 uppercase tracking-tighter">{ext}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-8 space-y-3">
          {files.map((file, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-6 py-4 rounded-2xl bg-[#050816]/60 border border-white/5 group hover:border-cyan-400/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <HiOutlineDocumentText className="text-xl text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{file.name}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mt-0.5">DATA FRAGMENT: {(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/10 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all border-none cursor-pointer"
              >
                <HiOutlineX className="text-lg" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
