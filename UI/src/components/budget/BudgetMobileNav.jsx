import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Wallet, PlusCircle, Receipt, Tag as TagIcon, BarChart2 } from 'lucide-react';
import '../../styles/budgetPadmanabhan.css';

const BudgetMobileNav = () => {
  const location = useLocation();

  // Highlight 'Add' button specially if currently on /add-transaction
  const isAdd = location.pathname.includes('/add-transaction');

  return (
    <nav className="budget-mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="budget-mobile-nav-inner">
        <NavLink
          to="/budget_padmanabhan"
          end
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Wallet size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/budget_padmanabhan/transactions"
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Receipt size={20} />
          <span>History</span>
        </NavLink>

        {/* Center Floating Plus Button */}
        <NavLink
          to="/budget_padmanabhan/add-transaction"
          className={`mobile-nav-item mobile-nav-center ${isAdd ? 'active' : ''}`}
          title="Add Transaction"
        >
          <div className="mobile-add-btn">
            <PlusCircle size={24} color="#ffffff" />
          </div>
          <span style={{ marginTop: '2px' }}>Add Spend</span>
        </NavLink>

        <NavLink
          to="/budget_padmanabhan/add-tags"
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <TagIcon size={20} />
          <span>Tags</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BudgetMobileNav;
