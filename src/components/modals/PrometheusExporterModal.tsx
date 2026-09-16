// // ============================================================
// // ADSUN Dashboard — PrometheusExporterModal.tsx
// // OpenMetrics/Prometheus text export — copy + download
// // ============================================================

// import React, { useMemo, useState } from "react";
// import { Copy, Download, CheckCheck, BarChart2 } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "../ui/dialog";
// import { Button } from "../ui/button";

// import { useToast } from "../../hooks/useToast";
// import { generatePrometheusExport } from "../../utils/prometheusExporter";

// export function PrometheusExporterModal() {
//   const modals = { prometheus: false };
//   const toast = useToast();
//   const [copied, setCopied] = useState(false);

//   // const onClose = () =>
//     // dispatch({ type: "CLOSE_MODAL", payload: "prometheus" });

//   // Regenerate on every open
//   // const exportText = useMemo(
//   //   () => generatePrometheusExport(servers),
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   //   [modals.prometheus, servers],
//   // );

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(exportText);
//       setCopied(true);
//       toast.copy("Prometheus metrics");
//       setTimeout(() => setCopied(false), 2500);
//     } catch {
//       toast.error(
//         "Copy failed",
//         "Clipboard access denied. Please select and copy manually.",
//       );
//     }
//   };

//   const handleDownload = () => {
//     const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `adsun-metrics-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//     toast.success("Downloaded", "Prometheus metrics file saved.");
//   };

//   const lineCount = exportText.split("\n").length;

//   return (
//     <Dialog
//       open={modals.prometheus}
//       onOpenChange={(open) => !open && onClose()}
//     >
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <div className="flex items-center gap-3 pr-8">
//             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/15 border border-green-500/30">
//               <BarChart2 className="h-4 w-4 text-green-400" />
//             </div>
//             <div>
//               <DialogTitle>Prometheus Export</DialogTitle>
//               <DialogDescription>
//                 OpenMetrics text format · {servers.length} nodes · {lineCount}{" "}
//                 lines
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>

//         {/* ─── Metrics Text Area ──────────────────────────────── */}
//         <div className="px-6 py-2">
//           <div className="relative">
//             {/* Header bar */}
//             <div className="flex items-center justify-between px-3 py-2 rounded-t-lg bg-black/60 border border-green-500/20 border-b-0">
//               <div className="flex gap-1.5">
//                 <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
//                 <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
//                 <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
//               </div>
//               <span className="text-[10px] text-green-500/60 font-mono">
//                 metrics.txt
//               </span>
//               <span className="text-[10px] text-green-500/40 font-mono">
//                 {lineCount} lines
//               </span>
//             </div>

//             {/* Code content */}
//             <textarea
//               readOnly
//               value={exportText}
//               id="prometheus-export-textarea"
//               className="w-full h-72 px-4 py-3 text-xs font-mono text-green-400 bg-black/80 border border-green-500/20 rounded-b-lg resize-none outline-none custom-scrollbar"
//               style={{ lineHeight: "1.6" }}
//             />
//           </div>
//         </div>

//         {/* ─── Footer ─────────────────────────────────────────── */}
//         <DialogFooter className="px-6 py-4">
//           <div className="flex items-center gap-2 mr-auto">
//             <span className="text-xs text-muted-foreground font-mono">
//               # HELP server_* gauge/counter
//             </span>
//           </div>
//           <Button variant="ghost" size="sm" onClick={onClose}>
//             Close
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={handleCopy}
//             id="prometheus-copy-btn"
//             className="gap-2"
//           >
//             {copied ? (
//               <>
//                 <CheckCheck className="h-3.5 w-3.5 text-green-400" /> Copied!
//               </>
//             ) : (
//               <>
//                 <Copy className="h-3.5 w-3.5" /> Copy
//               </>
//             )}
//           </Button>
//           <Button
//             variant="success"
//             size="sm"
//             onClick={handleDownload}
//             id="prometheus-download-btn"
//             className="gap-2"
//           >
//             <Download className="h-3.5 w-3.5" />
//             Download .txt
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
