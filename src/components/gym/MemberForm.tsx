import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useGymPlans } from '@/hooks/gym/useGymPlans';
import { CreateMemberInput, GymMember } from '@/hooks/gym/useGymMembers';

const formSchema = z.object({
  // Personal Information
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  birth_date: z.date({
    required_error: 'Birth date is required',
  }),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),

  // Address
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('Argentina'),

  // Membership
  membership_plan_id: z.string().min(1, 'Please select a membership plan'),
  start_date: z.date({
    required_error: 'Start date is required',
  }),

  // Additional
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MemberFormProps {
  member?: GymMember;
  initialData?: Partial<FormValues>;
  onSubmit: (data: CreateMemberInput) => Promise<void>;
  onCancel: () => void;
  onFormChange?: (data: Partial<FormValues>) => void;
  isLoading?: boolean;
}

export function MemberForm({ member, initialData, onSubmit, onCancel, onFormChange, isLoading }: MemberFormProps) {
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number>(0);
  const { useListPlans } = useGymPlans();
  const { data: plans, isLoading: plansLoading } = useListPlans({ is_active: true, is_visible: true });

  const getDefaultValues = (): Partial<FormValues> => {
    if (member) {
      return {
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        birth_date: member.birth_date ? new Date(member.birth_date) : undefined,
        gender: member.gender,
        address: member.address,
        city: member.city,
        state: member.state,
        postal_code: member.postal_code,
        country: member.country || 'Argentina',
        membership_plan_id: member.membership_plan_id,
        start_date: member.membership_start_date ? new Date(member.membership_start_date) : new Date(),
        notes: member.notes,
      };
    }
    if (initialData) {
      return {
        ...initialData,
        start_date: initialData.start_date || new Date(),
        country: initialData.country || 'Argentina',
      };
    }
    return {
      start_date: new Date(),
      country: 'Argentina',
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Notify parent of form changes for draft preservation
  useEffect(() => {
    if (onFormChange && !member) {
      const subscription = form.watch((values) => {
        onFormChange(values as Partial<FormValues>);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onFormChange, member]);

  // Update price when plan changes
  const watchPlanId = form.watch('membership_plan_id');
  useEffect(() => {
    if (watchPlanId && plans) {
      const selectedPlan = plans.find(p => p.plan_id === watchPlanId);
      if (selectedPlan) {
        setSelectedPlanPrice(selectedPlan.total_initial_cost);
      }
    }
  }, [watchPlanId, plans]);

  const handleSubmit = async (values: FormValues) => {
    const data: CreateMemberInput = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      birth_date: values.birth_date.toISOString(),
      gender: values.gender,
      address: values.address,
      city: values.city,
      state: values.state,
      postal_code: values.postal_code,
      country: values.country,
      membership_plan_id: values.membership_plan_id,
      membership_start_date: values.start_date.toISOString(),
      notes: values.notes,
    };

    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 9 11 1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Address</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Buenos Aires" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="CABA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="C1425" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Membership */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Membership</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="membership_plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Plan *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""} disabled={plansLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={plansLoading ? "Loading plans..." : "Select a plan"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans && plans.length > 0 ? (
                        plans.map((plan) => (
                          <SelectItem key={plan.plan_id} value={plan.plan_id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{plan.name}</span>
                              <span className="ml-2 text-muted-foreground">
                                ${plan.final_price}/month
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No hay planes disponibles
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedPlanPrice > 0 && (
                      <span className="font-medium text-primary">
                        Total initial payment: ${selectedPlanPrice}
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When should the membership become active?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information or special requirements..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || plansLoading}>
            {isLoading ? 'Processing...' : member ? 'Update Member' : 'Register Member'}
          </Button>
        </div>
      </form>
    </Form>
  );
}