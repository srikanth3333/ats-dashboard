import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuProps {
  trigger?: React.ReactNode; // Optional trigger element (e.g., button)
  title?: string; // Optional modal title
  className?: string; // Additional classes for the modal content
  data: any[];
  icon: React.ReactNode;
}

function DropdownMenuComponent({ title, data, icon }: MenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{icon}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-4">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="space-y-2 pb-3">
          {data?.map((record) => (
            <DropdownMenuItem onClick={record?.handleClick}>
              {record?.icon} {record.label}
              {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator /> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DropdownMenuComponent;
