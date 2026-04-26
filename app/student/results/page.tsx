import ResultsClient from "./ResultsClient";

async function getAnalytics() {
  try {
    const res = await fetch("http://127.0.0.1:8000/admin/allocate/compare", { 
      method: "POST",
      cache: "no-store" 
    });
    return await res.json();
  } catch (error) {
    return null;
  }
}

async function getCompanies() {
  try {
    const res = await fetch("http://127.0.0.1:8000/companies/", { cache: "no-store" });
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function ResultsPage() {
  const analytics = await getAnalytics();
  const companies = await getCompanies();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <ResultsClient analytics={analytics} companies={companies} />
    </div>
  );
}
