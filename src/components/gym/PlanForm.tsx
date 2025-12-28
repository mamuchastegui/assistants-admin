import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { CreatePlanInput, UpdatePlanInput, GymPlan } from '@/hooks/gym/useGymPlans';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  plan_type: z.enum(['basic', 'standard', 'premium', 'vip', 'student', 'corporate', 'family']),
  duration: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom']),
  duration_days: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  enrollment_fee: z.coerce.number().optional(),
  discount_percentage: z.coerce.number().min(0).max(100).optional(),
  max_freezes_allowed: z.coerce.number().min(0).default(0),
  max_freeze_days: z.coerce.number().min(0).default(0),
  guest_passes_per_month: z.coerce.number().min(0).default(0),
  classes_per_week_limit: z.coerce.number().optional(),
  access_hours_start: z.string().optional(),
  access_hours_end: z.string().optional(),
  weekend_access: z.boolean().default(true),
  auto_renew: z.boolean().default(false),
  renewal_discount_percentage: z.coerce.number().min(0).max(100).optional(),
  is_active: z.boolean().default(true),
  is_visible: z.boolean().default(true),
  max_members: z.coerce.number().optional(),
  features: z.array(z.string()).default([]),
  class_access: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

interface PlanFormProps {
  plan?: GymPlan;
  onSubmit: (data: CreatePlanInput | UpdatePlanInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const durationOptions = [
  { value: 'daily', label: 'Daily', days: 1 },
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly (3 months)', days: 90 },
  { value: 'semiannual', label: 'Semi-annual (6 months)', days: 180 },
  { value: 'annual', label: 'Annual', days: 365 },
  { value: 'custom', label: 'Custom', days: 0 },
];

export function PlanForm({ plan, onSubmit, onCancel, isLoading }: PlanFormProps) {
  const [newFeature, setNewFeature] = useState('');
  const [newClass, setNewClass] = useState('');
  const [newTag, setNewTag] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: plan ? {
      ...plan,
      enrollment_fee: plan.enrollment_fee || undefined,
      discount_percentage: plan.discount_percentage || undefined,
      classes_per_week_limit: plan.classes_per_week_limit || undefined,
      renewal_discount_percentage: plan.renewal_discount_percentage || undefined,
      max_members: plan.max_members || undefined,
    } : {
      name: '',
      description: '',
      plan_type: 'standard',
      duration: 'monthly',
      duration_days: 30,
      price: 0,
      max_freezes_allowed: 0,
      max_freeze_days: 0,
      guest_passes_per_month: 0,
      weekend_access: true,
      auto_renew: false,
      is_active: true,
      is_visible: true,
      features: [],
      class_access: [],
      tags: [],
    },
  });

  const watchDuration = form.watch('duration');

  // Auto-update duration_days when duration changes
  const handleDurationChange = (value: string) => {
    const option = durationOptions.find(opt => opt.value === value);
    if (option && option.days > 0) {
      form.setValue('duration_days', option.days);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const current = form.getValues('features');
      form.setValue('features', [...current, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const current = form.getValues('features');
    form.setValue('features', current.filter((_, i) => i !== index));
  };

  const handleAddClass = () => {
    if (newClass.trim()) {
      const current = form.getValues('class_access');
      form.setValue('class_access', [...current, newClass.trim()]);
      setNewClass('');
    }
  };

  const handleRemoveClass = (index: number) => {
    const current = form.getValues('class_access');
    form.setValue('class_access', current.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const current = form.getValues('tags');
      form.setValue('tags', [...current, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    const current = form.getValues('tags');
    form.setValue('tags', current.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan Name</FormLabel>
                <FormControl>
                  <Input placeholder="Premium Monthly" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what this plan includes..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="plan_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleDurationChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {watchDuration === 'custom' && (
            <FormField
              control={form.control}
              name="duration_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Duration (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Price (ARS)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollment_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enrollment Fee (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount % (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="renewal_discount_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Renewal Discount % (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} />
                  </FormControl>
                  <FormDescription>
                    Applied on auto-renewal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Features & Access</h3>

          <div className="space-y-2">
            <FormLabel>Plan Features</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Add a feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
              />
              <Button type="button" onClick={handleAddFeature}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('features').map((feature, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {feature}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveFeature(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel>Class Access</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Add a class type..."
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddClass();
                  }
                }}
              />
              <Button type="button" onClick={handleAddClass}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('class_access').map((cls, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {cls}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveClass(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="classes_per_week_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classes per Week Limit</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="Unlimited" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guest_passes_per_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Passes per Month</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="access_hours_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Hours Start</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="access_hours_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Hours End</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Membership Rules */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Membership Rules</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="max_freezes_allowed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Freezes Allowed</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Number of times membership can be frozen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_freeze_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Freeze Days</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Total days membership can be frozen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="max_members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Members (optional)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder="Unlimited" {...field} />
                </FormControl>
                <FormDescription>
                  Maximum number of members allowed on this plan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Settings</h3>

          <FormField
            control={form.control}
            name="weekend_access"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Weekend Access</FormLabel>
                  <FormDescription>
                    Members can access the gym on weekends
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auto_renew"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Auto Renew</FormLabel>
                  <FormDescription>
                    Automatically renew membership at the end of period
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Plan is currently active
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_visible"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Visible</FormLabel>
                  <FormDescription>
                    Show plan to new members during signup
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Tags */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tags</h3>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('tags').map((tag, index) => (
                <Badge key={index} variant="outline" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}