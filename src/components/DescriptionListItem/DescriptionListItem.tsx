import type { ReactNode } from 'react';

interface DescriptionListItemProps {
  term: string;
  detail: ReactNode;
  termClassName?: string;
  detailClassName?: string;
}

export function DescriptionListItem({
  term,
  detail,
  termClassName = '',
  detailClassName = '',
}: DescriptionListItemProps) {
  return (
    <>
      <dt
        className={`text-md font-bold text-cyan-800 inline before:content-[''] before:block before:leading-none ${termClassName}`}
      >
        {term}
      </dt>
      <dd className={`${detailClassName}`}>{detail}</dd>
    </>
  );
}
