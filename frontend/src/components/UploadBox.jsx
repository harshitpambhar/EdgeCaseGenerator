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
          borderColor: isDragging ? '#6366F1' : '#334155',
          backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
        }}
        className="relative rounded-2xl border-2 border-dashed border-[#334155] p-10 text-center cursor-pointer hover:border-[#6366F1]/50 transition-colors group"
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".zip,.tar,.gz,.py,.js,.ts,.java,.go,.rs,.cpp,.c,.rb"
        />
        <motion.div
          animate={{ y: isDragging ? -8 : 0 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center mb-4 group-hover:bg-[#6366F1]/20 transition-colors">
            <HiOutlineCloudUpload className="text-3xl text-[#818CF8]" />
          </div>
          <p className="text-base font-semibold text-[#F8FAFC] mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop your files'}
          </p>
          <p className="text-sm text-[#64748B] mb-4">or click to browse</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['.py', '.js', '.ts', '.java', '.go', '.zip'].map(ext => (
              <span key={ext} className="text-xs px-2 py-1 rounded-md bg-[#1E293B] text-[#94A3B8] border border-[#334155]">{ext}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1E293B]/60 border border-[#334155]/50"
            >
              <div className="flex items-center gap-3">
                <HiOutlineDocumentText className="text-[#818CF8]" />
                <div>
                  <p className="text-sm font-medium text-[#F8FAFC]">{file.name}</p>
                  <p className="text-xs text-[#64748B]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="w-7 h-7 rounded-lg hover:bg-[#EF4444]/10 flex items-center justify-center text-[#64748B] hover:text-[#EF4444] transition-all border-none cursor-pointer bg-transparent"
              >
                <HiOutlineX />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
