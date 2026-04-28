import React from "react";
import styles from "./Pagination.module.css";
import type { PaginationMeta } from "../../api/types/admin";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  disabled?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPerPageChange,
  disabled = false,
}) => {
  const { page, per_page, total, total_pages, has_prev, has_next } = pagination;
  const start = total === 0 ? 0 : (page - 1) * per_page + 1;
  const end = Math.min(page * per_page, total);

  return (
    <div className={styles.pagination}>
      <span className={styles.info}>
        显示 {start}–{end} / 共 {total} 条
      </span>

      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onPageChange(1)}
          disabled={disabled || !has_prev}
          title="首页"
        >
          «
        </button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || !has_prev}
          title="上一页"
        >
          ‹
        </button>
        <span className={styles.pageInfo}>
          第 {page} / {total_pages} 页
        </span>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || !has_next}
          title="下一页"
        >
          ›
        </button>
        <button
          className={styles.btn}
          onClick={() => onPageChange(total_pages)}
          disabled={disabled || !has_next}
          title="末页"
        >
          »
        </button>
      </div>

      <div className={styles.perPage}>
        <label className={styles.perPageLabel}>每页</label>
        <select
          value={per_page}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          disabled={disabled}
          className={styles.select}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>条</span>
      </div>
    </div>
  );
};

export default Pagination;
