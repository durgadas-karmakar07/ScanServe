import { Camera, ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import {
  getUploadSignature,
  MAX_PHOTO_BYTES,
  PHOTO_TYPES,
  uploadToCloudinary,
} from '../../api/uploads.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from './Button.jsx';

// Choose a photo, see it at once, upload it straight to Cloudinary, then hand { publicId,
// version } to the parent (which saves it). shape: 'wide' (4:3 dish, 16:7 cover) or 'circle'.
// onRemove may be async and return false when removing failed. isQuiet: the parent already tells
// the result (a toast), so this picker does not also announce "Photo uploaded" / "removed".
export default function PhotoPicker({
  kind,
  label,
  hint,
  currentUrl,
  shape = 'wide',
  aspect = 'aspect-[4/3]',
  isQuiet = false,
  onUploaded,
  onRemove,
  onBusyChange,
}) {
  const { withAuth } = useAuth();
  const inputRef = useRef(null);
  const changeRef = useRef(null);
  const labelId = useId();
  // `preview` is the last photo that uploaded (what the parent will save); `pending` is the one
  // uploading now. A failed upload drops only `pending`, so the picture always matches the save.
  const [preview, setPreview] = useState(null);
  const [pending, setPending] = useState(null);
  const pendingRef = useRef(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);

  // Free in-memory previews when they are replaced or the picker goes away.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  useEffect(() => () => pendingRef.current && URL.revokeObjectURL(pendingRef.current), []);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return setError('Use a JPG, PNG or WebP photo.');
    if (file.size > MAX_PHOTO_BYTES)
      return setError('This photo is over 5 MB. Choose a smaller one.');

    const url = URL.createObjectURL(file);
    pendingRef.current = url;
    setError('');
    setStatus('');
    setPending(url);
    onBusyChange?.(true);
    try {
      const signature = await withAuth(getUploadSignature, kind);
      await onUploaded(await uploadToCloudinary(file, signature));
      setPreview(url);
      if (!isQuiet) setStatus('Photo uploaded');
    } catch (err) {
      setError(err.message);
      URL.revokeObjectURL(url);
    } finally {
      pendingRef.current = null;
      setPending(null);
      onBusyChange?.(false);
    }
  };

  const isUploading = pending !== null;
  const isBusy = isUploading || isRemoving;

  // While busy, the buttons stay focusable (aria-disabled) but do nothing: `disabled` would
  // throw keyboard and screen reader focus off the button the owner just used.
  const openPicker = () => {
    if (!isBusy) inputRef.current?.click();
  };

  // Removing may save straight away (café cover and logo), so a second press waits for the
  // first. When it worked, Remove disappears with the photo, so focus moves to the photo button.
  const handleRemove = async () => {
    if (isBusy) return;
    setIsRemoving(true);
    try {
      if ((await onRemove()) === false) return;
      setPreview(null);
      changeRef.current?.focus();
      if (!isQuiet) setStatus('Photo removed');
    } finally {
      setIsRemoving(false);
    }
  };

  const busyProps = {
    'aria-disabled': isBusy || undefined,
    className: isBusy ? 'cursor-wait opacity-60' : '',
  };

  const shownUrl = pending ?? preview ?? currentUrl;
  const frame = shape === 'circle' ? 'size-28 rounded-full' : `${aspect} w-full rounded-card`;

  return (
    <div className="flex flex-col gap-2" role="group" aria-labelledby={labelId}>
      <span id={labelId} className="font-semibold">
        {label}
      </span>
      <div className={`relative overflow-hidden border border-border bg-primary-soft ${frame}`}>
        {shownUrl ? (
          <img src={shownUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1 text-primary">
            <ImagePlus size={32} aria-hidden="true" className="opacity-70" />
            <span className="text-sm">No photo yet</span>
          </span>
        )}
        {isUploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-text/40 text-white">
            <LoaderCircle size={32} className="animate-spin" aria-hidden="true" />
          </span>
        )}
      </div>
      {/* Always rendered, so screen readers hear "Uploading photo…" and the result. */}
      <p className="sr-only" role="status">
        {isUploading ? 'Uploading photo…' : isRemoving ? 'Removing photo…' : status}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          ref={changeRef}
          variant="secondary"
          isFullWidth={false}
          {...busyProps}
          onClick={openPicker}
        >
          <Camera size={24} aria-hidden="true" />
          {shownUrl ? 'Change photo' : 'Add photo'}
        </Button>
        {shownUrl && onRemove && (
          <Button variant="secondary" isFullWidth={false} {...busyProps} onClick={handleRemove}>
            <Trash2 size={24} aria-hidden="true" />
            Remove
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_TYPES.join(',')}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFile}
      />
      {hint && !error && <p className="text-sm text-text-muted">{hint}</p>}
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
