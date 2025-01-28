import React from "react"

export function SpinnerLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="loader"></div>
      <p className="mt-4 text-primary ">Processing...</p>
      <style>{`
        .loader {
          width: 50px;
          aspect-ratio: 1;
          display: grid;
          color: #1c2c26;
          background: 
            conic-gradient(from 90deg at 3px 3px,#0000 90deg,currentColor 0)
            -3px -3px/calc(50% + 1.5px) calc(50% + 1.5px);
          animation: l28 2s infinite;
        }
        .loader::before,
        .loader::after {
          content: "";
          grid-area: 1/1;
          background: repeating-conic-gradient(#0000 0 35deg,currentColor 0 90deg);
          -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 3px),#000 0);
          border-radius: 50%;
        }
        .loader::after {
          margin: 20%;
        }
        @keyframes l28 {
          100% {transform: rotate(1turn)}
        }
      `}</style>
    </div>
  )
}

