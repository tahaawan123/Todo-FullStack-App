import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Save, X } from 'lucide-react';

interface InlineEditProps {
  value: string;
  description?: string;
  onSave: (title: string, description?: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  description = '',
  onSave,
  onCancel,
  placeholder = 'Edit title...'
}) => {
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<{ title: string; description?: string }>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('title', value);
    setValue('description', description || '');
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [value, description, setValue]);

  const onSubmit = (data: { title: string; description?: string }) => {
    onSave(data.title, data.description);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="space-y-2">
        <div>
          <Controller
            name="title"
            control={control}
            defaultValue={value}
            rules={{
              required: 'Title is required',
              minLength: { value: 1, message: 'Title cannot be empty' },
              maxLength: { value: 200, message: 'Title is too long' }
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={placeholder}
                className={errors.title ? 'border-destructive' : ''}
                ref={(e) => {
                  field.ref(e);
                  // Also assign to our local ref for focusing
                  if (inputRef && e) {
                    inputRef.current = e;
                  }
                }}
              />
            )}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Controller
            name="description"
            control={control}
            defaultValue={description || ''}
            rules={{ maxLength: { value: 1000, message: 'Description is too long' } }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Edit description (optional)..."
              />
            )}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <Button type="submit" variant="primary" size="sm">
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default InlineEdit;