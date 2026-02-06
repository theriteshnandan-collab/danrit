import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// We will fetch this dataServer Side
interface Log {
    id: string;
    endpoint: string;
    method: string;
    status_code: number;
    duration_ms: number;
    created_at: string;
}

export function RequestLogTable({ logs }: { logs: Log[] }) {
    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-zinc-500 border border-zinc-800 rounded-lg bg-zinc-900/50">
                No requests logged yet.
            </div>
        );
    }

    return (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-zinc-900">
                        <TableHead className="text-zinc-400">Time</TableHead>
                        <TableHead className="text-zinc-400">Method</TableHead>
                        <TableHead className="text-zinc-400">Endpoint</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-right text-zinc-400">Duration</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableCell className="font-mono text-xs text-zinc-500">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-zinc-300 font-medium">{log.method}</TableCell>
                            <TableCell className="text-zinc-300 font-mono text-xs">{log.endpoint}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={
                                        log.status_code >= 200 && log.status_code < 300
                                            ? "border-emerald-500/20 text-emerald-500"
                                            : "border-red-500/20 text-red-500"
                                    }
                                >
                                    {log.status_code}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs text-zinc-500">
                                {log.duration_ms}ms
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
