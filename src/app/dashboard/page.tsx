"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Clock, CheckCircle2, Download } from "lucide-react";

type VehicleLog = {
    id: string;
    plateNumber: string;
    ownerName: string | null;
    drivingLicense: string | null;
    entryTime: string;
    exitTime: string | null;
    isNITTExempt: boolean;
};

export default function DashboardPage() {
    const [logs, setLogs] = useState<VehicleLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        fetchLogs();
        // Update 'now' every minute to refresh warnings
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/logs");
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (log: VehicleLog) => {
        if (log.exitTime) return { status: "exited", classes: "opacity-60 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" };
        if (log.isNITTExempt) return { status: "nitt", classes: "bg-white dark:bg-slate-800 border-green-200 dark:border-green-900/50" };

        const entry = new Date(log.entryTime);
        const diffHours = (now.getTime() - entry.getTime()) / (1000 * 60 * 60);

        if (diffHours >= 2) {
            return { status: "danger", classes: "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 shadow-sm" };
        } else if (diffHours >= 1) {
            return { status: "warning", classes: "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800 shadow-sm" };
        }

        return { status: "normal", classes: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" };
    };

    const handleExit = async (id: string) => {
        try {
            const res = await fetch(`/api/logs/${id}/exit`, { method: "PUT" });
            if (res.ok) {
                fetchLogs();
            }
        } catch (error) {
            console.error("Failed to update exit time", error);
        }
    };

    const downloadCSV = () => {
        if (logs.length === 0) return;

        const headers = ["ID", "Plate Number", "Owner Name", "Driving License", "Entry Time", "Exit Time", "Is NITT Exempt"];
        
        const rows = logs.map(log => [
            log.id,
            log.plateNumber,
            log.ownerName || "",
            log.drivingLicense || "",
            new Date(log.entryTime).toLocaleString(),
            log.exitTime ? new Date(log.exitTime).toLocaleString() : "Still inside",
            log.isNITTExempt ? "Yes" : "No"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `vehicle_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Security Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Monitor all vehicles currently inside the campus.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                        title="Download Logs as CSV"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse flex space-x-2">
                        <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-brand-500 rounded-full animation-delay-200"></div>
                        <div className="w-3 h-3 bg-brand-500 rounded-full animation-delay-400"></div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {logs.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 glass border rounded-xl">
                            No vehicles logged yet.
                        </div>
                    ) : (
                        logs.map(log => {
                            const info = getStatusInfo(log);
                            const duration = log.exitTime
                                ? ((new Date(log.exitTime).getTime() - new Date(log.entryTime).getTime()) / (1000 * 60 * 60)).toFixed(1)
                                : ((now.getTime() - new Date(log.entryTime).getTime()) / (1000 * 60 * 60)).toFixed(1);

                            return (
                                <div key={log.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-xl border transition-colors ${info.classes}`}>
                                    <div className="flex items-start space-x-4">
                                        <div className="mt-1">
                                            {info.status === "danger" && <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />}
                                            {info.status === "warning" && <Clock className="h-6 w-6 text-amber-500 dark:text-amber-400" />}
                                            {info.status === "nitt" && <CheckCircle2 className="h-6 w-6 text-green-500 dark:text-green-400" />}
                                            {(info.status === "normal" || info.status === "exited") && <CheckCircle2 className="h-6 w-6 text-slate-400 dark:text-slate-500" />}
                                        </div>

                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xl font-bold font-mono tracking-widest uppercase text-slate-900 dark:text-white">
                                                    {log.plateNumber}
                                                </span>
                                                {log.isNITTExempt && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                        NITT EXEMPT
                                                    </span>
                                                )}
                                                {log.exitTime && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                        EXITED
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-sm mt-2 text-slate-600 dark:text-slate-400 grid sm:grid-cols-2 gap-x-8 gap-y-1">
                                                <div><span className="font-semibold text-slate-500">Name:</span> {log.ownerName || "Unknown"}</div>
                                                <div><span className="font-semibold text-slate-500">License:</span> {log.drivingLicense || "N/A"}</div>
                                                <div><span className="font-semibold text-slate-500">Entry:</span> {new Date(log.entryTime).toLocaleTimeString()}</div>
                                                {log.exitTime ? (
                                                    <div><span className="font-semibold text-slate-500">Exit:</span> {new Date(log.exitTime).toLocaleTimeString()}</div>
                                                ) : (
                                                    <div><span className="font-semibold text-slate-500">Duration:</span> {duration} hours</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!log.exitTime && (
                                        <button
                                            onClick={() => handleExit(log.id)}
                                            className="mt-4 sm:mt-0 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Mark Exit
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
