import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { monitoring } from '@/lib/monitoring';

// Health check endpoint for monitoring and load balancers
export async function GET() {
  const startTime = performance.now();

  try {
    // Check database connectivity
    const dbStart = performance.now();
    const { data: dbCheck, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    const dbDuration = performance.now() - dbStart;

    // Check Supabase auth
    const authStart = performance.now();
    const { data: authCheck, error: authError } =
      await supabase.auth.getSession();
    const authDuration = performance.now() - authStart;

    // Get monitoring stats
    const errorStats = monitoring.getErrorStats();
    const perfStats = monitoring.getPerformanceStats();

    const totalDuration = performance.now() - startTime;

    // Determine overall health status
    const isHealthy =
      !dbError && !authError && dbDuration < 1000 && authDuration < 500;

    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {
        database: {
          status: dbError ? 'error' : 'healthy',
          duration: Math.round(dbDuration),
          error: dbError?.message,
        },
        auth: {
          status: authError ? 'error' : 'healthy',
          duration: Math.round(authDuration),
          error: authError?.message,
        },
        monitoring: {
          errors_24h: errorStats.total,
          critical_errors: errorStats.critical,
          avg_response_time: perfStats?.avgDuration || null,
        },
      },
      performance: {
        total_check_duration: Math.round(totalDuration),
        memory_usage: process.memoryUsage?.().heapUsed || null,
      },
    };

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': isHealthy ? 'pass' : 'fail',
      },
    });
  } catch (error) {
    // Critical failure
    monitoring.trackError(error as Error, 'critical', {
      context: 'health_check',
      duration: performance.now() - startTime,
    });

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
        duration: Math.round(performance.now() - startTime),
      },
      { status: 503 }
    );
  }
}

// Minimal ready check for Kubernetes/Docker
export async function HEAD() {
  try {
    // Quick database ping
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle();

    return new NextResponse(null, {
      status: error ? 503 : 200,
      headers: { 'X-Ready': error ? 'false' : 'true' },
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
