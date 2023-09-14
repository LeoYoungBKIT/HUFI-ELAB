import { Alert, Snackbar } from "@mui/material";

interface IProps {
  errorMessage: string;
}

const ErrorComponent = ({ errorMessage }: IProps) => {
  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ width: "500px" }}
      autoHideDuration={6000}
    >
      <Alert severity="error" sx={{ width: "100%" }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  );
};

export default ErrorComponent;
