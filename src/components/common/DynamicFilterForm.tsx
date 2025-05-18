/* eslint-disable @typescript-eslint/no-explicit-any */
// components/DynamicFilterForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/Combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define the filter field types
export type InputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "checkbox"
  | "radio"
  | "select"
  | "multiSelect"
  | "slider"
  | "switch"
  | "date"
  | "textarea"
  | "combobox"
  | "multi";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  name: string;
  label: string;
  inputType: InputType;
  defaultValue?: any;
  placeholder?: string;
  description?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  className?: string;
  colSpan?: string;
}

export interface DynamicFilterFormProps {
  fields: FilterField[];
  onFilterChange: (values: Record<string, any>) => void;
  className?: string;
  submitButton?: boolean;
  liveUpdate?: boolean;
  defaultValues?: Record<string, any>;
}

const DynamicFilterForm: React.FC<DynamicFilterFormProps> = ({
  fields,
  onFilterChange,
  className,
  submitButton = false,
  liveUpdate = true,
  defaultValues = {},
}) => {
  // Dynamically create a schema based on the fields
  const createSchema = () => {
    const schema: Record<string, any> = {};

    fields.forEach((field) => {
      let validator;

      switch (field.inputType) {
        case "email":
          validator = z.string().email().optional();
          break;
        case "number":
          validator = z.number().optional();
          if (field.min !== undefined)
            validator = z.number().min(field.min).optional();
          if (field.max !== undefined)
            validator = validator.unwrap().max(field.max).optional();
          break;
        case "checkbox":
          validator = z.boolean().optional();
          break;
        case "radio":
        case "select":
        case "combobox":
          validator = z.string().optional();
          break;
        case "multiSelect":
        case "multi":
          validator = z.array(z.string()).optional();
          break;
        case "slider":
          validator = z.number().optional();
          break;
        case "switch":
          validator = z.boolean().optional();
          break;
        case "date":
          validator = z.date().optional();
          break;
        case "textarea":
        case "text":
        case "password":
        default:
          validator = z.string().optional();
          break;
      }

      if (field.required) {
        validator = validator.unwrap().optional().unwrap();
      }

      schema[field.name] = validator;
    });

    return z.object(schema);
  };

  // Prepare the default values
  const prepareDefaultValues = () => {
    const values: Record<string, any> = { ...defaultValues };

    fields.forEach((field) => {
      if (
        values[field.name] === undefined &&
        field.defaultValue !== undefined
      ) {
        values[field.name] = field.defaultValue;
      }
    });

    return values;
  };

  const formSchema = createSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: prepareDefaultValues(),
  });

  // Submit handler
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onFilterChange(data);
  };

  // Set up watch to capture all form changes
  React.useEffect(() => {
    if (liveUpdate) {
      const subscription = form.watch((value) => {
        onFilterChange(value);
      });

      return () => subscription.unsubscribe();
    }
  }, [form, liveUpdate, onFilterChange]);

  // Render a specific field based on its type
  const renderField = (field: FilterField) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem
            className={cn(field.colSpan || "col-span-full", field.className)}
          >
            <FormLabel>{field.label}</FormLabel>
            <FormControl>{renderInput(field, formField)}</FormControl>
            {field.description && (
              <FormDescription>{field.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // Helper to render the actual input component
  const renderInput = (field: FilterField, formField: any) => {
    switch (field.inputType) {
      case "text":
      case "email":
      case "password":
        return (
          <Input
            {...formField}
            type={field.inputType}
            placeholder={field.placeholder}
          />
        );

      case "number":
        return (
          <Input
            {...formField}
            type="number"
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            onChange={(e) => formField.onChange(parseFloat(e.target.value))}
          />
        );

      case "checkbox":
        return (
          <Checkbox
            checked={formField.value}
            onCheckedChange={formField.onChange}
          />
        );

      case "radio":
        return (
          <RadioGroup
            value={formField.value}
            onValueChange={formField.onChange}
            className="flex"
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${field.name}-${option.value}`}
                />
                <FormLabel
                  htmlFor={`${field.name}-${option.value}`}
                  className="font-normal"
                >
                  {option.label}
                </FormLabel>
              </div>
            ))}
          </RadioGroup>
        );

      case "select":
        return (
          <Select value={formField.value} onValueChange={formField.onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiSelect":
        return (
          <div className="w-full">
            <Select
              value={formField.value?.[0] || ""}
              onValueChange={(val) => {
                const currentValues = new Set(formField.value || []);
                if (currentValues.has(val)) {
                  currentValues.delete(val);
                } else {
                  currentValues.add(val);
                }
                formField.onChange(Array.from(currentValues));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "combobox":
        return (
          <Combobox
            options={field.options || []}
            value={formField.value || ""}
            onChange={formField.onChange}
            placeholder={field.placeholder}
            disabled={field.required && !formField.value}
            className="w-full"
          />
        );

      case "multi":
        return (
          <MultiSelect
            options={field.options || []}
            onValueChange={formField.onChange}
            defaultValue={formField.value || []}
            placeholder={field.placeholder}
            variant="default"
            maxCount={3}
            className="w-full"
          />
        );

      case "slider":
        return (
          <Slider
            defaultValue={[formField.value || field.min || 0]}
            min={field.min}
            max={field.max}
            step={field.step}
            onValueChange={(vals) => formField.onChange(vals[0])}
          />
        );

      case "switch":
        return (
          <Switch
            checked={formField.value}
            onCheckedChange={formField.onChange}
          />
        );

      case "date":
        return (
          <DatePicker date={formField.value} setDate={formField.onChange} />
        );

      case "textarea":
        return <Textarea {...formField} placeholder={field.placeholder} />;

      default:
        return <Input {...formField} />;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        <div className="grid grid-cols-12 gap-4">{fields.map(renderField)}</div>

        {submitButton && (
          <Button type="submit" className="mt-4">
            Apply Filters
          </Button>
        )}
      </form>
    </Form>
  );
};

export default DynamicFilterForm;
