const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

// Money is stored as whole rupees; this is the one place it becomes text (Rules.md section 2).
export const formatRupees = (amount) => rupees.format(amount);
