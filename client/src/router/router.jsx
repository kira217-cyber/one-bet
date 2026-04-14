import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Withdraw from "../pages/Withdraw/Withdraw";
import Deposit from "../pages/Deposit/Deposit";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Account from "../pages/Account/Account";
import Promotions from "../pages/Promotions/Promotions";
import Games from "../pages/Games/Games";
import AutoDeposit from "../pages/AutoDeposit/AutoDeposit";
import PlayGame from "../pages/PlayGame/PlayGame";
import HistoryLayout from "../HistoryLayout/HistoryLayout";
import DepositHistory from "../pages/DepositHistory/DepositHistory";
import WithdrawHistory from "../pages/WithdrawHistory/WithdrawHistory";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import BetHistory from "../pages/BetHistory/BetHistory";
import TurnoverHistory from "../pages/TurnoverHistory/TurnoverHistory";


export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "withdraw",
        element: (
          <PrivateRoute>
            <Withdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit",
        element: (
          <PrivateRoute>
            <Deposit />
          </PrivateRoute>
        ),
      },
      {
        path: "auto-deposit",
        element: (
          <PrivateRoute>
            <AutoDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "play-game/:gameId",
        element: (
          <PrivateRoute>
            <PlayGame />
          </PrivateRoute>
        ),
      },
      {
        path: "account",
        element: (
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        ),
      },
      {
        path: "promotions",
        element: (
          <PrivateRoute>
            <Promotions />
          </PrivateRoute>
        ),
      },
      {
        path: "category/:categoryId/games",
        element: <Games />,
      },

      /* ✅ History route RootLayout এর ভিতরে */
      {
        path: "history",
        element: (
          <PrivateRoute>
            <HistoryLayout />
          </PrivateRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="deposit" replace />,
          },
          {
            path: "deposit-history",
            element: <DepositHistory />,
          },
          {
            path: "withdraw-history",
            element: <WithdrawHistory />,
          },
          {
            path: "auto-deposit-history",
            element: <AutoDepositHistory />,
          },
          {
            path: "bet-history",
            element: <BetHistory />,
          },
          {
            path: "turnover-history",
            element: <TurnoverHistory />,
          },
        ],
      },

      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);
