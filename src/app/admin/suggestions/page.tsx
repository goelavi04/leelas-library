import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Suggested Acquisitions" };

export default async function SuggestionsPage() {
  const supabase = await createClient();

  const [{ data: zeroResults }, { data: genreDemand }] = await Promise.all([
    supabase
      .from("zero_result_searches")
      .select("*")
      .order("searched_at", { ascending: false })
      .limit(50),
    supabase.rpc("get_genre_demand"),
  ]);

  const topDemand = (genreDemand ?? []).filter((row) => row.total_borrows > 0).slice(0, 10);

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold text-green-deep">Suggested Acquisitions</h1>
      <p className="mt-2 text-ink-soft">
        Two simple, real signals for what to buy next — grounded in what people actually searched
        for and borrowed, not guesses.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-semibold text-green-deep">
          Searches that found nothing
        </h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          People searched for these and the catalog had no matches.
        </p>
        {(!zeroResults || zeroResults.length === 0) ? (
          <p className="mt-4 text-ink-soft">No zero-result searches yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[400px] text-left text-[15px]">
              <thead className="bg-paper-dim text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Search</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {zeroResults.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-ink">{row.query}</td>
                    <td className="px-4 py-3 text-ink-soft">{format(new Date(row.searched_at), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-semibold text-green-deep">High demand, low availability</h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          Genres that get borrowed often relative to how many copies exist — consider adding more.
        </p>
        {topDemand.length === 0 ? (
          <p className="mt-4 text-ink-soft">Not enough borrowing history yet to tell.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[600px] text-left text-[15px]">
              <thead className="bg-paper-dim text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Genre</th>
                  <th className="px-4 py-3 font-medium">Books in catalog</th>
                  <th className="px-4 py-3 font-medium">Currently available</th>
                  <th className="px-4 py-3 font-medium">Total borrows</th>
                  <th className="px-4 py-3 font-medium">Demand ratio</th>
                </tr>
              </thead>
              <tbody>
                {topDemand.map((row) => (
                  <tr key={row.genre} className="border-t border-line">
                    <td className="px-4 py-3 font-medium text-ink">{row.genre}</td>
                    <td className="px-4 py-3 text-ink-soft">{row.total_books}</td>
                    <td className="px-4 py-3 text-ink-soft">{row.available_books}</td>
                    <td className="px-4 py-3 text-ink-soft">{row.total_borrows}</td>
                    <td className="px-4 py-3 text-ink-soft">{row.demand_ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
