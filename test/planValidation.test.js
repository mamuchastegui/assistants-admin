import assert from 'assert';
import { z } from 'zod';

// Mirror the schema from PlanForm.tsx for validation testing
const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripcion es requerida'),
  plan_type: z.enum(['basic', 'standard', 'premium', 'vip', 'student', 'corporate', 'family']),
  duration: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'custom']),
  duration_days: z.coerce.number().min(1, 'La duracion debe ser al menos 1 dia'),
  price: z.coerce.number().min(1, 'El precio debe ser mayor a 0'),
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

// Test 1: Valid plan data should pass validation
console.log('Test 1: Valid plan data should pass validation');
const validPlan = {
  name: 'Plan Mensual',
  description: 'Acceso completo al gimnasio',
  plan_type: 'standard',
  duration: 'monthly',
  duration_days: 30,
  price: 15000,
  weekend_access: true,
  auto_renew: false,
  is_active: true,
  is_visible: true,
};
const result1 = formSchema.safeParse(validPlan);
assert.equal(result1.success, true, 'Valid plan should pass validation');
console.log('  PASSED');

// Test 2: Price of 0 should fail validation
console.log('Test 2: Price of 0 should fail validation');
const zeroPricePlan = {
  ...validPlan,
  price: 0,
};
const result2 = formSchema.safeParse(zeroPricePlan);
assert.equal(result2.success, false, 'Zero price should fail validation');
assert.equal(result2.error.issues[0].message, 'El precio debe ser mayor a 0');
console.log('  PASSED');

// Test 3: Empty name should fail validation
console.log('Test 3: Empty name should fail validation');
const emptyNamePlan = {
  ...validPlan,
  name: '',
};
const result3 = formSchema.safeParse(emptyNamePlan);
assert.equal(result3.success, false, 'Empty name should fail validation');
assert.equal(result3.error.issues[0].message, 'El nombre es requerido');
console.log('  PASSED');

// Test 4: Empty description should fail validation
console.log('Test 4: Empty description should fail validation');
const emptyDescPlan = {
  ...validPlan,
  description: '',
};
const result4 = formSchema.safeParse(emptyDescPlan);
assert.equal(result4.success, false, 'Empty description should fail validation');
assert.equal(result4.error.issues[0].message, 'La descripcion es requerida');
console.log('  PASSED');

// Test 5: Duration days of 0 should fail validation
console.log('Test 5: Duration days of 0 should fail validation');
const zeroDaysPlan = {
  ...validPlan,
  duration_days: 0,
};
const result5 = formSchema.safeParse(zeroDaysPlan);
assert.equal(result5.success, false, 'Zero duration days should fail validation');
console.log('  PASSED');

// Test 6: Invalid plan type should fail validation
console.log('Test 6: Invalid plan type should fail validation');
const invalidTypePlan = {
  ...validPlan,
  plan_type: 'invalid_type',
};
const result6 = formSchema.safeParse(invalidTypePlan);
assert.equal(result6.success, false, 'Invalid plan type should fail validation');
console.log('  PASSED');

// Test 7: Discount percentage over 100 should fail
console.log('Test 7: Discount percentage over 100 should fail');
const overDiscountPlan = {
  ...validPlan,
  discount_percentage: 150,
};
const result7 = formSchema.safeParse(overDiscountPlan);
assert.equal(result7.success, false, 'Discount over 100% should fail validation');
console.log('  PASSED');

// Test 8: Negative discount percentage should fail
console.log('Test 8: Negative discount percentage should fail');
const negativeDiscountPlan = {
  ...validPlan,
  discount_percentage: -10,
};
const result8 = formSchema.safeParse(negativeDiscountPlan);
assert.equal(result8.success, false, 'Negative discount should fail validation');
console.log('  PASSED');

// Test 9: Valid plan with all optional fields
console.log('Test 9: Valid plan with all optional fields');
const fullPlan = {
  name: 'Plan VIP Completo',
  description: 'Acceso VIP con todos los beneficios',
  plan_type: 'vip',
  duration: 'annual',
  duration_days: 365,
  price: 150000,
  enrollment_fee: 5000,
  discount_percentage: 10,
  max_freezes_allowed: 3,
  max_freeze_days: 30,
  guest_passes_per_month: 2,
  classes_per_week_limit: 10,
  access_hours_start: '06:00',
  access_hours_end: '23:00',
  weekend_access: true,
  auto_renew: true,
  renewal_discount_percentage: 5,
  is_active: true,
  is_visible: true,
  max_members: 100,
  features: ['Acceso 24/7', 'Locker personal', 'Toalla'],
  class_access: ['Spinning', 'Yoga', 'CrossFit'],
  tags: ['premium', 'recomendado'],
};
const result9 = formSchema.safeParse(fullPlan);
assert.equal(result9.success, true, 'Full plan should pass validation');
console.log('  PASSED');

console.log('\nAll plan validation tests passed!');
