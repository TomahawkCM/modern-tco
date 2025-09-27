import { NextRequest, NextResponse } from 'next/server';
import { TaniumQueryEngine } from '@/lib/tanium-query-engine';

// Initialize the query engine
const queryEngine = new TaniumQueryEngine();

// Example queries for testing
const EXAMPLE_QUERIES = [
  {
    id: "aq-basics-count",
    title: "Count machines by OS platform",
    domain: "AQ",
    difficulty: 1,
    question: "Get count() from all machines group by OS Platform"
  },
  {
    id: "aq-performance-cpu",
    title: "High CPU Windows workstations",
    domain: "AQ",
    difficulty: 2,
    question: 'Get Computer Name and CPU Percent from all machines where Operating System contains "Windows" and Computer Role equals "Workstation" and CPU Percent is greater than "65" order by CPU Percent desc limit 5'
  },
  {
    id: "rq-laptops-group",
    title: "Laptop disk capacity",
    domain: "RQ",
    difficulty: 2,
    question: 'Get Computer Name, Disk Free GB, Memory GB from group "Laptops" order by Disk Free GB'
  },
  {
    id: "rd-avg-disk",
    title: "Average disk free by group",
    domain: "RD",
    difficulty: 2,
    question: "Get avg(Disk Free GB), max(Disk Free GB) from all machines group by Group"
  }
];

export async function GET() {
  try {
    const catalog = {
      sensors: queryEngine.getSensorsCatalog().map(sensor => ({
        name: sensor.name,
        category: sensor.category,
        description: sensor.description
      })),
      aggregates: queryEngine.getAggregateFunctions()
    };

    const examples = {
      examples: EXAMPLE_QUERIES
    };

    return NextResponse.json({
      ok: true,
      catalog,
      examples
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read simulator metadata';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}