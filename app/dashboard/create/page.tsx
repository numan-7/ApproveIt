"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, X } from "lucide-react"

export default function CreateApproval() {
  const router = useRouter()
  const [approvers, setApprovers] = useState<string[]>([])
  const [newApprover, setNewApprover] = useState("")

  const addApprover = () => {
    if (newApprover && !approvers.includes(newApprover)) {
      setApprovers([...approvers, newApprover])
      setNewApprover("")
    }
  }

  const removeApprover = (email: string) => {
    setApprovers(approvers.filter((a) => a !== email))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-full bg-white">
      <div>
        <h1 className="text-3xl font-bold mb-6">Create New Approval Request</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Request Name</Label>
            <Input id="name" placeholder="Enter approval name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter approval description" required />
          </div>
          <div className="space-y-2">
            <Label>Approver(s)</Label>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter approver email"
                value={newApprover}
                onChange={(e) => setNewApprover(e.target.value)}
                className="flex-grow"
              />
              <Button type="button" onClick={addApprover}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {approvers.map((email) => (
                <Badge key={email} variant="default" className="text-sm pl-2 pr-1">
                  {email}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2 hover:bg-transparent"
                    onClick={() => removeApprover(email)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup defaultValue="medium">
              <div className="flex flex-col sm:flex-row sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="priority-medium" />
                  <Label htmlFor="priority-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high">High</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <Input id="attachments" type="file" multiple />
          </div>
          <Button type="submit" className="w-full">
            Create Approval Request
          </Button>
        </form>
      </div>
    </div>
  )
}

