import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  History, 
  Search, 
  Calendar as CalendarIcon,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus
} from 'lucide-react';
import { Transaction, Product } from '@/types/inventory';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

interface TransactionHistoryProps {
  transactions: Transaction[];
  products: Product[];
}

export default function TransactionHistory({ transactions, products }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    const product = products.find(p => p.id === transaction.productId);
    const productName = product?.name.toLowerCase() || '';
    const matchesSearch = productName.includes(searchTerm.toLowerCase()) ||
                         transaction.id.includes(searchTerm);
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    let matchesDate = true;
    if (dateRange.from || dateRange.to) {
      const transactionDate = new Date(transaction.timestamp);
      if (dateRange.from && dateRange.to) {
        matchesDate = isWithinInterval(transactionDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to)
        });
      } else if (dateRange.from) {
        matchesDate = transactionDate >= startOfDay(dateRange.from);
      } else if (dateRange.to) {
        matchesDate = transactionDate <= endOfDay(dateRange.to);
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const sortedTransactions = filteredTransactions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalTransactions = filteredTransactions.length;
  const totalValue = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalQuantity = filteredTransactions.reduce((sum, t) => {
    return sum + (t.type === 'add' ? t.quantity : -t.quantity);
  }, 0);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <Plus className="h-4 w-4" />;
      case 'buy':
      case 'sell':
        return <Minus className="h-4 w-4" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'default';
      case 'buy':
        return 'destructive';
      case 'sell':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Product', 'Type', 'Quantity', 'Price', 'Total', 'Notes'].join(','),
      ...sortedTransactions.map(transaction => {
        const product = products.find(p => p.id === transaction.productId);
        return [
          format(new Date(transaction.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          product?.name || 'Unknown Product',
          transaction.type,
          transaction.quantity,
          transaction.price || '',
          transaction.total || '',
          transaction.notes || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Filtered results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Transaction value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Quantity</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity > 0 ? '+' : ''}{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Items net change
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction Filters</CardTitle>
            <Button onClick={exportTransactions} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="add">Stock Added</SelectItem>
                <SelectItem value="buy">Purchases</SelectItem>
                <SelectItem value="sell">Sales</SelectItem>
                <SelectItem value="adjust">Adjustments</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full lg:w-64">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                    ) : (
                      format(dateRange.from, 'MMM dd, yyyy')
                    )
                  ) : (
                    'Pick dates'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRange({});
                      setShowDatePicker(false);
                    }}
                    className="w-full"
                  >
                    Clear Dates
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({sortedTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedTransactions.map((transaction) => {
                const product = products.find(p => p.id === transaction.productId);
                return (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {product?.name || 'Unknown Product'}
                            </h3>
                            <Badge variant={getTransactionColor(transaction.type) as "default" | "destructive" | "outline" | "secondary"}>
                              {transaction.type}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Quantity: {transaction.quantity} items</p>
                            {transaction.price && (
                              <p>Price per item: ${transaction.price.toFixed(2)}</p>
                            )}
                            {transaction.total && (
                              <p className="font-medium text-foreground">
                                Total: ${transaction.total.toFixed(2)}
                              </p>
                            )}
                            {transaction.notes && (
                              <p>Notes: {transaction.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{format(new Date(transaction.timestamp), 'MMM dd, yyyy')}</p>
                        <p>{format(new Date(transaction.timestamp), 'HH:mm')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}