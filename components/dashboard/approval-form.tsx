"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { useMyApprovals } from "@/hooks/useMyApprovals";
import { useAuth } from "@/context/AuthContext";
import type { Approval } from "@/types/approval";
import type { Attachment } from "@/types/approval"; 
import { SpinnerLoader } from "../ui/spinner-loader";
import { Badge } from "@/components/ui/badge";

export function ApprovalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user, loading: authLoading } = useAuth();
  const { approvals, addApproval, updateApproval, loading } = useMyApprovals();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [approvers, setApprovers] = useState<string[]>([]);
  const [newApprover, setNewApprover] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (editId) {
      const approvalToEdit = approvals.find(a => a.id === Number(editId));
      if (approvalToEdit) {
        setName(approvalToEdit.name);
        setDescription(approvalToEdit.description);
        setApprovers(approvalToEdit.approvers);
        setPriority(approvalToEdit.priority);
        setAttachments(approvalToEdit.attachments);
      }
    }
  }, [editId, approvals]);

  const isLoading = authLoading || loading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const attachmentsArray: Attachment[] = Array.from(e.target.files).map(file => ({
        name: file.name,
        type: file.type,
        size: `${file.size}`, 
        url: file.name, 
      }));
      setAttachments(attachmentsArray);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); 

    if (approvers.length === 0) {
      setError("Please add at least one approver.");
      return;
    }

    if (user?.email && approvers.includes(user.email)) {
      setError("You cannot add yourself as an approver.");
      return;
    }

    const newApproval: Approval = {
      id: editId ? Number(editId) : Date.now(),
      name,
      description,
      requester: user?.email ?? "unknown",
      approvers,
      date: new Date().toLocaleDateString(),
      status: "pending",
      priority,
      comments: [],
      attachments, 
    };

    if (editId) {
      updateApproval(newApproval.id, newApproval);
    } else {
      addApproval(newApproval);
    }
    router.push("/dashboard");
  };

  const addApproverHandler = () => {
    if (!newApprover) return;
    if (user && newApprover === user.email) {
      setError("You cannot add yourself as an approver.");
      return;
    }
    if (!approvers.includes(newApprover)) {
      setApprovers([...approvers, newApprover]);
      setNewApprover("");
      setError("");
    }
  };

  const removeApprover = (email: string) => {
    setApprovers(approvers.filter(a => a !== email));
  };

  // Allow pressing Enter to add an approver.
  const handleApproverKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addApproverHandler();
    }
  };

  return (
    <>
      {isLoading ? (
        <SpinnerLoader />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="name">Request Name</Label>
            <Input
              id="name"
              placeholder="Enter approval name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter approval description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Approver(s)</Label>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter approver email"
                value={newApprover}
                onChange={(e) => setNewApprover(e.target.value)}
                onKeyDown={handleApproverKeyDown}
                className="flex-grow"
              />
              <Button type="button" onClick={addApproverHandler}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {approvers.map((email) => (
                <Badge
                  key={email}
                  variant="outline"
                  className="font-normal text-sm pl-2 pr-1"
                >
                  {email}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2 text-red-700 hover:text-red-700 rounded-sm"
                    onClick={() => removeApprover(email)}
                  >
                    <X className="h-4 w-4 hover:text-inherit" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup
              value={priority}
              onValueChange={(value: string) =>
                setPriority(value as "high" | "medium" | "low")
              }
            >
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
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            {attachments.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm">
                {attachments.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
          <Button type="submit" className="w-full">
            {editId ? "Update Approval Request" : "Create Approval Request"}
          </Button>
        </form>
      )}
    </>
  );
}
