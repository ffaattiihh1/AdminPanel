import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface Column {
  header: string;
  accessor: string;
}

interface Action {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick?: (item: any) => void;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  renderCell?: (item: any, column: Column) => React.ReactNode;
  actions?: (item: any) => Action[];
}

export default function DataTable({ columns, data, renderCell, actions }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((column) => (
              <th key={column.accessor} className="text-left py-3 px-6 text-sm font-semibold text-slate-700">
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="text-right py-3 px-6 text-sm font-semibold text-slate-700">
                İşlemler
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.accessor} className="py-4 px-6">
                  {renderCell ? renderCell(item, column) : item[column.accessor]}
                </td>
              ))}
              {actions && (
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {actions(item).map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant="ghost"
                        size="sm"
                        className={`p-2 ${action.color} hover:bg-slate-100 transition-colors`}
                        title={action.label}
                        onClick={() => action.onClick?.(item)}
                      >
                        <action.icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">Veri bulunamadı</p>
        </div>
      )}
    </div>
  );
}
