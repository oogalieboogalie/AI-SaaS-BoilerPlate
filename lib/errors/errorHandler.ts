import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function errorHandler(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.errors[0].message },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
