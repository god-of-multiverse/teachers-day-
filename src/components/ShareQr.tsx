import { useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

export default function ShareQr() {
  const [open, setOpen] = useState(false);
  const url = `${window.location.origin}${window.location.pathname}?start=cover`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Show QR code"
        title="Share with a QR code"
        className="glass flex h-10 items-center justify-center rounded-full px-3 text-xs font-semibold tracking-wider text-cream uppercase"
      >
        QR
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[800] flex items-center justify-center bg-black/75 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xs rounded-3xl bg-cream p-6 text-center text-plum shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="font-display text-2xl">Share the wishes</h2>
            <p className="mt-1 text-xs text-plum/65">Scan this code to open the Teacher's Day book.</p>
            <div className="mx-auto mt-5 w-fit rounded-xl bg-white p-3">
              <QRCodeSVG value={url} size={190} includeMargin />
            </div>
            <p className="mt-4 break-all text-[0.65rem] text-plum/60">{url}</p>
            <button onClick={() => setOpen(false)} className="mt-4 rounded-full bg-plum px-4 py-2 text-xs font-semibold text-cream">Close</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
