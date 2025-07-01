import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/utils/supabase/server"

export default async function PaymentsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moje platby</CardTitle>
        <CardDescription>
          Prehľad vašich platieb.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dátum</TableHead>
              <TableHead>Suma</TableHead>
              <TableHead>Stav</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>2023-06-23</TableCell>
              <TableCell>€50.00</TableCell>
              <TableCell>
                <Badge>Zaplatené</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2023-05-23</TableCell>
              <TableCell>€50.00</TableCell>
              <TableCell>
                <Badge>Zaplatené</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
