import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCloudUpload, HiOutlineX, HiOutlineDocument } from 'react-icons/hi';

export default function UploadBox({ onFilesSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(p => [...p, ...dropped]);
    onFilesSelected?.(dropped);
  }, [onFilesSelected]);

  const handleInput = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(p => [...p, ...selected]);
    onFilesSelected?.(selected);
  };

  return (
    <div className="space-y-3">
      <motion.div
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        animate={{ borderColor: isDragging ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)', backgroundColor: isDragging ? 'rgba(99,102,241,0.04)' : 'transparent' }}
        className="relative rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors"
      >
        <input type="file" multiple onChange={handleInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept=".zip,.tar,.gz,.py,.js,.ts,.java,.go,.rs,.cpp,.c,.rb" />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDragging ? 'bg-indigo-500/15' : 'bg-white/[0.04]'}`}>
            <HiOutlineCloudUpload className={`text-2xl transition-colors ${isDragging ? 'text-indigo-400' : 'text-white/30'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{isDragging ? 'Drop files here' : 'Drop files or click to browse'}</p>
            <p className="text-xs text-white/30 mt-1">.py, .js, .ts, .java, .go, .zip and more</p>
          </div>
        </div>
      </motion.div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <HiOutlineDocument className="text-white/30 text-base flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 truncate">{file.name}</p>
                <p className="text-xs text-white/25">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                className="w-6 h-6 rounded-md hover:bg-rose-500/10 flex items-center justify-center text-white/25 hover:text-rose-400 transition-colors border-none cursor-pointer bg-transparent">
                <HiOutlineX className="text-sm" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
