import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full absolute bottom-0 left-0 right-0 z-50 py-2">
      <p className="text-center text-sm text-white/70 px-4">
        &copy; 2025 ApproveIt &nbsp;|&nbsp; Feedback?{' '}
        <Link
          className="hover:underline"
          href="https://docs.google.com/forms/d/e/1FAIpQLSewnrwEvl8wamQs_PZ6s1LRZ3PHbX66pTj8Pf6toMJj4RSKOQ/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
        >
          Click here
        </Link>
        .
      </p>
    </footer>
  );
}
