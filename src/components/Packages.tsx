
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package } from '@/types/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Package as PackageIcon, Loader2 } from 'lucide-react';

interface PackagesProps {
  onSelect: (packageId: number, amount: number) => void;
  isLoading: boolean;
}

const Packages: React.FC<PackagesProps> = ({ onSelect, isLoading }) => {
  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('amount');
      if (error) throw error;
      return data as Package[];
    },
  });

  if (packagesLoading) {
    return <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {packages?.map((pkg) => (
        <Card
          key={pkg.id}
          className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all group"
        >
          <div className="flex flex-col items-center text-center">
            <PackageIcon className="h-12 w-12 mb-4 text-white/70 group-hover:text-white transition-colors" />
            <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
            <p className="text-2xl font-bold text-white/90 mb-4">
              {pkg.amount} opBNB
            </p>
            <Button
              onClick={() => onSelect(pkg.id, pkg.amount)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                'Select Package'
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default Packages;
