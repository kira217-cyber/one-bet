import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import AddWithdraw from "../pages/AddWithdraw/AddWithdraw";
import AddDeposit from "../pages/AddDeposit/AddDeposit";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Profile from "../pages/Profile/Profile";
import CreateAdmin from "../pages/CreateAdmin/CreateAdmin";
import AddPromotion from "../pages/AddPromotion/AddPromotion";
import AllUser from "../pages/AllUser/AllUser";
import AllAffiliateUser from "../pages/AllAffiliateUser/AllAffiliateUser";
import UserDetails from "../pages/UserDetails/UserDetails";
import AffUserDetails from "../pages/AffUserDetails/AffUserDetails";
import DepositRequest from "../pages/DepositRequest/DepositRequest";
import DepositRequestDetails from "../pages/DepositRequestDetails/DepositRequestDetails";
import WithdrawRequestDetails from "../pages/WithdrawRequestDetails/WithdrawRequestDetails";
import WithdrawRequest from "../pages/WithdrawRequest/WithdrawRequest";
import AddCategory from "../pages/AddCategory/AddCategory";
import AddProvider from "../pages/AddProvider/AddProvider";
import AddGames from "../pages/AddGames/AddGames";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import AutoDepositSetting from "../pages/AutoDepositSetting/AutoDepositSetting";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute permKey="dashboard">
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute permKey="dashboard">
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute permKey="profile">
            <Profile />
          </PrivateRoute>
        ),
      },

      {
        path: "add-withdraw",
        element: (
          <PrivateRoute permKey="add-withdraw">
            <AddWithdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit",
        element: (
          <PrivateRoute permKey="add-deposit">
            <AddDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "create-admin",
        element: (
          <PrivateRoute motherOnly>
            <CreateAdmin />
          </PrivateRoute>
        ),
      },
      {
        path: "add-promotion",
        element: (
          <PrivateRoute permKey="add-promotion">
            <AddPromotion />
          </PrivateRoute>
        ),
      },
      {
        path: "all-user",
        element: (
          <PrivateRoute permKey="all-user">
            <AllUser />
          </PrivateRoute>
        ),
      },
      {
        path: "all-affiliate-user",
        element: (
          <PrivateRoute permKey="all-affiliate-user">
            <AllAffiliateUser />
          </PrivateRoute>
        ),
      },
      {
        path: "/all-user-details/:id",
        element: (
          <PrivateRoute permKey="all-user-details">
            {" "}
            <UserDetails />{" "}
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-user-details/:id",
        element: (
          <PrivateRoute permKey="affiliate-user-details">
            <AffUserDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-request",
        element: (
          <PrivateRoute permKey="deposit-request">
            {" "}
            <DepositRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-request/:id",
        element: (
          <PrivateRoute permKey="deposit-request-details">
            {" "}
            <DepositRequestDetails />{" "}
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw-request",
        element: (
          <PrivateRoute permKey="withdraw-request">
            <WithdrawRequest />
          </PrivateRoute>
        ),
      },
      {
        path: "withdraw-request/:id",
        element: (
          <PrivateRoute permKey="withdraw-request-details">
            <WithdrawRequestDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "add-game-category",
        element: (
          <PrivateRoute permKey="add-game-category">
            <AddCategory />
          </PrivateRoute>
        ),
      },
      {
        path: "add-provider",
        element: (
          <PrivateRoute permKey="add-provider">
            <AddProvider />
          </PrivateRoute>
        ),
      },
      {
        path: "add-games",
        element: (
          <PrivateRoute permKey="add-games">
            <AddGames />
          </PrivateRoute>
        ),
      },
      {
        path: "add-auto-deposit",
        element: (
          <PrivateRoute permKey="add-auto-deposit">
            <AutoDepositSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "auto-deposit-history",
        element: (
          <PrivateRoute permKey="auto-deposit-history">
            <AutoDepositHistory />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
