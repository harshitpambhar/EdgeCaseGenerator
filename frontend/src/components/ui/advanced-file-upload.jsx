import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, Film, Music, FileSpreadsheet } from 'lucide-react';

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type.startsWith('video/')) return <Film className="w-4 h-4" />;
  if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
  if (type.includes('pdf') || type.includes('document') || type.includes('word')) return <FileText className="w-4 h-4" />;
  if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export function FileUpload({
  accept = "*/*",
  multiple = true,
  maxSize = 10 * 1024 * 1024,
  onFilesSelect,
  onFilesRemove,
  disabled = false,
  className = "",
}) {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  const validate = (file) => {
    const errs = [];
    if (file.size > maxSize) errs.push(`Exceeds ${formatSize(maxSize)} limit`);
    return errs;
  };

  const process = useCallback((newFiles) => {
    const arr = Array.from(newFiles);
    const valid = [];
    const errs = [];
    arr.forEach(file => {
      const e = validate(file);
      if (e.length === 0) {
        valid.push({ file, id: Math.random().toString(36).slice(2, 9), name: file.name, size: file.size, type: file.type });
      } else {
        errs.push(`${file.name}: ${e.join(', ')}`);
      }
    });
    const updated = multiple ? [...files, ...valid] : valid.slice(0, 1);
    setFiles(updated);
    setErrors(errs);
    onFilesSelect?.(updated);
  }, [files, multiple, maxSize, onFilesSelect]);

  const remove = (id) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    onFilesRemove?.(updated);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        onDragEnter={e => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
        onDragLeave={e => { e.preventDefault(); if (!disabled) setIsDragOver(false); }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!disabled) { setIsDragOver(false); process(e.dataTransfer.files); } }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isDragOver
            ? 'border-indigo-400/60 bg-indigo-500/5'
            : 'border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]'
        }`}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={e => process(e.target.files)} disabled={disabled} className="hidden" />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isDragOver ? 'bg-indigo-500/20' : 'bg-white/[0.05]'}`}>
            <Upload className={`w-5 h-5 transition-colors ${isDragOver ? 'text-indigo-400' : 'text-white/30'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">
              {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-white/30 mt-1">
              {accept === "*/*" ? "Any file type" : accept} · Max {formatSize(maxSize)}
              {multiple ? ' · Multiple files' : ' · Single file'}
            </p>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => <p key={i} className="text-xs text-rose-400">{err}</p>)}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="text-white/30 flex-shrink-0">{getFileIcon(f.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 truncate">{f.name}</p>
                <p className="text-xs text-white/30">{formatSize(f.size)}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); remove(f.id); }} disabled={disabled}
                className="text-white/20 hover:text-rose-400 transition-colors border-none bg-transparent cursor-pointer p-1 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;