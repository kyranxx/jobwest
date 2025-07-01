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
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/utils/supabase/server"

export default async function MyAdsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moje inzeráty</CardTitle>
        <CardDescription>
          Prehľad vašich pridaných inzerátov.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Názov pozície</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead>Dátum pridania</TableHead>
              <TableHead>Akcie</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Software Engineer</TableCell>
              <TableCell>
                <Badge>Aktívny</Badge>
              </TableCell>
              <TableCell>2023-06-23</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Upraviť</Button>
                <Button variant="destructive" size="sm" className="ml-2">Vymazať</Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>UI/UX Designer</TableCell>
              <TableCell>
                <Badge variant="secondary">Neaktívny</Badge>
              </TableCell>
              <TableCell>2023-06-20</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">Upraviť</Button>
                <Button variant="destructive" size="sm" className="ml-2">Vymazať</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
