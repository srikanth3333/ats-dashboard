import { updateRecord } from "@/app/actions/action";
import { Modal } from "@/components/common/modal";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PageData {
  id: string;
  name: string;
  type: string;
  create: boolean;
  edit: boolean;
  delete: boolean;
  view: boolean;
  href?: string;
}

interface EditModalProps {
  user?: any;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDataChange?: (changedItem: PageData, allData: PageData[]) => void;
  row: any;
}

function EditModal({ row, isOpen, setIsOpen, onDataChange }: EditModalProps) {
  const initialData: PageData[] = row?.acess_roles;
  const [data, setData] = useState<PageData[]>(initialData);

  const [pageSize] = useState(10);
  const [currentPage] = useState(1);
  const [lastChangedItem, setLastChangedItem] = useState<PageData | null>(null);
  console.log(row?.pages);
  const onOpenChange = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setData(row?.acess_roles);
  }, [row?.id]);

  const handleSwitchChange = async (
    id: string,
    field: "create" | "edit" | "delete" | "view",
    value: boolean,
    href?: string
  ) => {
    let changedItem: PageData | null = null;

    // Update access roles
    const updatedAccessRoles = data.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        changedItem = updatedItem;
        return updatedItem;
      }
      return item;
    });

    // Update pages (immutably)
    const updatedPages =
      row?.pages?.map((record: any) => {
        if (record?.href === href) {
          return { ...record, [field]: value };
        }
        return record;
      }) ?? [];
    console.log("updatedPages", updatedPages);
    // return;
    // Call update API
    const updateUser = await updateRecord("user_profile", row?.id, {
      acess_roles: updatedAccessRoles,
      pages: field === "view" ? updatedPages : row?.pages,
    });

    if (updateUser?.success) {
      toast("Updated Successfully");
      setData(updatedAccessRoles);

      if (changedItem) {
        setLastChangedItem(changedItem);
        if (onDataChange) {
          onDataChange(changedItem, updatedAccessRoles);
        }
      }
    } else {
      toast("Failed to update");
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data?.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <Modal
        className="w-[800px]"
        onOpenChange={onOpenChange}
        isOpen={isOpen}
        title="Manage Pages"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex gap-4">
            <h2>{row?.email_id}</h2>
            <h2>{row?.user_id ? "Verified" : "Not Verified"}</h2>
          </div>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>Page Name</TableHead>
                <TableHead>Create</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
                <TableHead>View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData?.map((page) => (
                <TableRow
                  key={page.id}
                  className={
                    lastChangedItem?.id === page.id ? "bg-blue-50" : ""
                  }
                >
                  <TableCell className="font-medium">{page.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={page.create}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(page.id, "create", checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={page.edit}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(page.id, "edit", checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={page.delete}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(page.id, "delete", checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={page.view}
                      onCheckedChange={(checked) =>
                        handleSwitchChange(page.id, "view", checked, page.href)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Modal>
    </div>
  );
}

export default EditModal;
