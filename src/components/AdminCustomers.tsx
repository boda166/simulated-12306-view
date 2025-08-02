import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  created_at: string;
  phone?: string;
  avatar_url?: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, roleFilter]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
      // Fallback mock data
      setCustomers([
        {
          id: '1',
          email: 'sarah@example.com',
          full_name: 'Sarah Johnson',
          role: 'user',
          created_at: '2024-01-15T10:00:00Z',
          phone: '+1234567890'
        },
        {
          id: '2',
          email: 'admin@example.com',
          full_name: 'Admin User',
          role: 'admin',
          created_at: '2024-01-10T08:00:00Z',
          phone: '+1234567891'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(customer => customer.role === roleFilter);
    }

    setFilteredCustomers(filtered);
  };

  const updateCustomerRole = async (customerId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(prev => 
        prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, role: newRole }
            : customer
        )
      );

      toast.success(`Customer role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating customer role:', error);
      toast.error('Failed to update customer role');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{customers.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admin Users</p>
              <p className="text-2xl font-bold">
                {customers.filter(c => c.role === 'admin').length}
              </p>
            </div>
            <UserX className="h-8 w-8 text-rose-gold" />
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Regular Users</p>
              <p className="text-2xl font-bold">
                {customers.filter(c => c.role === 'user').length}
              </p>
            </div>
            <MoreHorizontal className="h-8 w-8 text-deep-rose" />
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm || roleFilter !== 'all' ? 'No customers match your filters' : 'No customers found'}
          </p>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-gold to-deep-rose rounded-full flex items-center justify-center text-white font-medium">
                  {customer.full_name?.charAt(0) || customer.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{customer.full_name || 'No name'}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <Badge variant={getRoleBadgeVariant(customer.role)}>
                    {customer.role}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <Select
                  value={customer.role}
                  onValueChange={(newRole: 'admin' | 'user') => updateCustomerRole(customer.id, newRole)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;