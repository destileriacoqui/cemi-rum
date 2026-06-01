const Stripe = require('stripe');

const ALLOWED_PURPOSES = new Set(['shipping', 'pickup']);

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe server environment variables are not configured.');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function identityPurpose(value) {
  if (!ALLOWED_PURPOSES.has(value)) throw new Error('Choose a valid ID verification option.');
  return value;
}

async function identitySession(id, purpose) {
  if (!id) throw new Error('Complete the secure ID verification before continuing.');
  const expectedPurpose = identityPurpose(purpose);
  const session = await stripeClient().identity.verificationSessions.retrieve(id);
  if (session.metadata?.purpose !== expectedPurpose) throw new Error('This ID verification cannot be used for this checkout.');
  return session;
}

async function requireVerifiedIdentity(id, purpose) {
  const session = await identitySession(id, purpose);
  if (session.status !== 'verified') throw new Error('Complete the secure ID verification before continuing.');
  return session;
}

module.exports = { identityPurpose, identitySession, requireVerifiedIdentity, stripeClient };
