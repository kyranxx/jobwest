import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function AddAdPage() {
  const addAd = async (formData: FormData) => {
    "use server"
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return redirect("/login")
    }

    const { error } = await supabase.from("jobs").insert([
      {
        title: formData.get("title"),
        description: formData.get("description"),
        location: formData.get("location"),
        salary: formData.get("salary"),
        jobType: formData.get("jobType"),
        country_code: formData.get("country_code"),
        is_top: false,
        category: "it", // default category
      },
    ])

    if (error) {
      console.error("Error inserting job:", error)
      return
    }

    return redirect("/dashboard/my-ads")
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pridať nový inzerát</CardTitle>
        <CardDescription>
          Vyplňte formulár a pridajte novú pracovnú ponuku.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Názov pozície</Label>
            <Input id="title" name="title" placeholder="Zadajte názov pozície" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Popis</Label>
            <Textarea id="description" name="description" placeholder="Zadajte popis" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Lokalita</Label>
              <Input id="location" name="location" placeholder="Zadajte lokalitu" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Plat</Label>
              <Input id="salary" name="salary" placeholder="Zadajte plat" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="jobType">Typ úväzku</Label>
              <Select name="jobType">
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte typ úväzku" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zivnost">Živnosť</SelectItem>
                  <SelectItem value="na-zmluvu">Na zmluvu</SelectItem>
                  <SelectItem value="brigada">Brigáda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Krajina</Label>
              <Select name="country_code">
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte krajinu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Nemecko</SelectItem>
                  <SelectItem value="at">Rakúsko</SelectItem>
                  <SelectItem value="nl">Holandsko</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button formAction={addAd}>Pridať inzerát</Button>
        </form>
      </CardContent>
    </Card>
  )
}
