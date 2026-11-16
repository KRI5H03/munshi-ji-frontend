"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { PrimaryAction } from "@/components/shell/list-actions";
import { GuardedLink } from "@/components/shell/navigation-guard";
import { Card, PageHeader, btnOutline, btnPrimary } from "@/components/ui/kit";
import { ListError, ListMessage, ListPlaceholder, ListSearch } from "@/components/ui/list-states";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useFirmId } from "@/hooks/use-firm-id";
import { CONTACTS_LIMIT, listContacts } from "@/lib/api/contacts";
import { formatPhone } from "@/lib/money";
import { keys } from "@/lib/query";
import { contactTypeLabel } from "@/lib/schemas/contact";
import { stateName } from "@/lib/states";
import type { Contact } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Only suppliers and "both" get a label; a plain customer is the usual case. */
function TypeLabel({ contact }: { contact: Contact }) {
  if (contact.contactType === "customer") return null;
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 text-sm font-semibold text-muted-foreground">
      {contactTypeLabel(contact.contactType)}
    </span>
  );
}

function ContactsTable({ contacts }: { contacts: Contact[] }) {
  return (
    <Card className="hidden overflow-hidden p-0 sm:block sm:p-0">
      <table className="w-full text-left">
        <thead className="border-b border-border bg-muted/60 text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Place</th>
            <th className="px-4 py-3 font-semibold">GSTIN</th>
            <th className="hidden px-4 py-3 font-semibold lg:table-cell">Phone</th>
            <th className="px-6 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {contacts.map((c) => (
            <tr key={c.id}>
              <td className="px-6 py-3">
                <span className="flex flex-wrap items-center gap-2 text-lg font-bold">
                  {c.name}
                  <TypeLabel contact={c} />
                </span>
              </td>
              <td className="px-4 py-3">
                {c.city}
                <span className="block text-muted-foreground">{stateName(c.stateCode)}</span>
              </td>
              <td className="num px-4 py-3 whitespace-nowrap">
                {c.gstin ?? <span className="text-muted-foreground">None</span>}
              </td>
              <td className="num hidden px-4 py-3 whitespace-nowrap lg:table-cell">
                {c.phone ? formatPhone(c.phone) : <span className="text-muted-foreground">None</span>}
              </td>
              <td className="px-6 py-3 text-right">
                <GuardedLink href={`/customers/${c.id}`} className={btnOutline} aria-label={`Edit ${c.name}`}>
                  Edit
                </GuardedLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function ContactCards({ contacts }: { contacts: Contact[] }) {
  return (
    <ul className="grid gap-3 sm:hidden">
      {contacts.map((c) => (
        <li key={c.id}>
          <GuardedLink
            href={`/customers/${c.id}`}
            aria-label={`Edit ${c.name}`}
            className="block rounded-xl border border-border bg-card p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="flex flex-wrap items-center gap-2 text-lg font-bold">
              {c.name}
              <TypeLabel contact={c} />
            </span>
            <span className="mt-1 block">
              {c.city}, {stateName(c.stateCode)}
            </span>
            <span className="num block text-muted-foreground">
              {c.gstin ? `GSTIN ${c.gstin}` : "No GSTIN"}
              {c.phone && `, ${formatPhone(c.phone)}`}
            </span>
          </GuardedLink>
        </li>
      ))}
    </ul>
  );
}

export function CustomersList() {
  const firmId = useFirmId();
  const [text, setText] = useState("");
  const search = useDebouncedValue(text.trim(), 300);
  const { data, error, isError, isPending, isPlaceholderData, refetch } = useQuery({
    queryKey: keys.contactsSearch(firmId ?? "", search),
    queryFn: ({ signal }) => listContacts(search, signal),
    enabled: Boolean(firmId),
    placeholderData: keepPreviousData,
  });

  let body: React.ReactNode;
  if (isError && !data) {
    body = <ListError what="Customers" error={error} onRetry={() => refetch()} />;
  } else if (isPending || !data) {
    body = <ListPlaceholder label="Loading customers" columns={["flex-1", "w-28", "w-40", "w-28", "h-12 w-20"]} />;
  } else if (data.length === 0 && search) {
    body = (
      <ListMessage title={`No customer matches “${search}”`}>
        <p className="text-muted-foreground">Search by name or city.</p>
        <button type="button" className={btnOutline} onClick={() => setText("")}>
          Clear search
        </button>
      </ListMessage>
    );
  } else if (data.length === 0) {
    body = (
      <ListMessage title="No customers yet">
        <p className="text-muted-foreground">Add the parties you bill. Suppliers can be added here too.</p>
        <GuardedLink href="/customers/new" className={btnPrimary}>
          <Plus className="size-5" aria-hidden />
          Add your first customer
        </GuardedLink>
      </ListMessage>
    );
  } else {
    body = (
      <div className={cn("transition-opacity duration-150", isPlaceholderData && "opacity-60")}>
        <ContactsTable contacts={data} />
        <ContactCards contacts={data} />
        {data.length >= CONTACTS_LIMIT && (
          <p className="mt-4 text-muted-foreground">
            Showing the first {CONTACTS_LIMIT}, A to Z. Search to find others.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Customers" sub="A to Z" actions={<PrimaryAction sectionHref="/customers" />} />
      <ListSearch value={text} onChange={setText} label="Search customers" placeholder="Search name or city" />
      <p className="sr-only" role="status">
        {data ? `${data.length} shown` : ""}
      </p>
      <div className="mt-6">{body}</div>
    </>
  );
}
