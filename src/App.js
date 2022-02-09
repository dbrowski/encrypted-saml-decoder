import React, { useState, lazy, Suspense } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { makeStyles } from "@material-ui/core/styles";
import Base64 from "crypto-js/enc-base64";
import Utf8 from "crypto-js/enc-utf8";
import pako from "pako";
import prettyData from "pretty-data";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ghcolors } from "react-syntax-highlighter/dist/esm/styles/prism";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    color: "#2E4355"
  },
  innerMain: {
    display: "flex",
    margin: "0",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    color: "#2E4355"
  },
  image: {
    backgroundImage:
      "url(https://pingidentity.com/content/dam/ping-6-2-assets/open-graph-images/2019/P14C-Build-OG.png)",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#576877",
    backgroundSize: "cover",
    backgroundPosition: "center",
    maxHeight: "20%"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "#2E4355"
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: "0"
  },
  submit: {
    backgroundColor: "#2E4355",
    margin: theme.spacing(3, 0, 2)
  },
  typography: {
    color: "#2E4355",
    fontSize: "1%"
  },
  errorMessage: {
    color: "red"
  },
  infoPaperContainer: {
    maxHeight: "100%",
    overflow: "auto"
  },
  info: {
    height: "100%",
    maxHeight: "100%",
    color: "#2E4355",
    margin: "0",
    padding: "0"
  }
}));

export default function App() {
  // Use the above styles.
  const classes = useStyles();

  // State variables and setters.
  const [saml, setSaml] = useState("");
  const [deflatedSaml, setDeflatedSaml] = useState("");
  const [decodedSaml, setDecodedSaml] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [samlError, setSamlError] = React.useState(null);

  const open = Boolean(anchorEl);
  const id = open ? "popover" : undefined;

  const handleSubmit = event => {
    event.preventDefault();

    try {
      decode();
    } catch (e) {
      // Gets the reason for failure.
      let msg = JSON.stringify(e);
      console.error(e);
      console.error(msg);
      setSamlError(msg);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleSAMLChange = event => {
    event.preventDefault();
    setSaml(event.target.value);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const encode = samlRequest => {
    const array = Utf8.parse(samlRequest);
    const base64 = Base64.stringify(array);
    const urlEncoded = encodeURIComponent(base64);
  };

  const decode = () => {
    let utf8ToUtf16decoder = new TextDecoder("utf-8", { fatal: true });

    // uri decode
    const saml_uri_decoded = decodeURIComponent(saml);
    // base64 decode
    const saml_base64_decoded = atob(saml_uri_decoded);
    // this is the deflated xml
    setDeflatedSaml(saml_base64_decoded);
    // inflate
    const saml_inflated = pako.inflateRaw(saml_base64_decoded);
    // currently a utf8 integer array, decode as utf16
    const utf16Decoded = utf8ToUtf16decoder.decode(saml_inflated);
    // we now have a decoded saml request, update state
    setDecodedSaml(utf16Decoded);
  };

  return (
    <Container spacing={0} className={classes.root}>
      <Grid
        container
        display="flex"
        component="main"
        className={classes.innerMain}
        direction="column"
      >
        <Grid
          item
          xs={12}
          justify="center"
          style={{
            flex: "1 1 1"
          }}
        >
          <Avatar className={classes.avatar}>
            <LockOpenIcon />
          </Avatar>
        </Grid>

        <Grid
          item
          container
          direction="column"
          justify="space-between"
          alignItems="stretch"
          xs={12}
          style={{ flex: "10 1 auto" }}
        >
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid item xs={12} style={{ flex: "10 1 auto" }}>
              <Typography
                component="h5"
                variant="h5"
                align="left"
                style={{
                  paddingBottom: "1rem"
                }}
              >
                SAML Request{" "}
                <Typography variant="body1" style={{ display: "inline-flex" }}>
                  (deflated, utf8 encoded, uri encoded)
                </Typography>
              </Typography>
              {/* JWT input field */}
              <TextField
                variant="outlined"
                margin="none"
                required
                fullWidth
                id="saml"
                label="SAML"
                name="SAML"
                value={saml}
                autoFocus
                rowsMax={4}
                multiline
                style={{
                  fontFamily: "Monospace",
                  fontSize: "1vmin"
                }}
                onChange={handleSAMLChange}
              />

              {/* Error Message for JWT String Decode */}
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "center",
                  horizontal: "center"
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center"
                }}
              >
                <Typography className={classes.errorMessage}>
                  {samlError}
                </Typography>
              </Popover>
            </Grid>
            <Grid item xs={12} style={{ flex: "1 0 auto" }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Decode
              </Button>
            </Grid>
            <Grid item xs={12} style={{ flex: "10 0 auto" }}>
              <Typography component="h5" variant="h5" align="left">
                Deflated XML{" "}
                <Typography variant="body1" style={{ display: "inline-flex" }}>
                  (base64 decoded, uri decoded)
                </Typography>
              </Typography>
              <Box
                border={1}
                borderRadius={5}
                borderColor="#576877"
                height="100%"
                minHeight="10vh"
                maxWidth="100%"
                marginBottom=".5rem"
                padding="0"
                textAlign="left"
              >
                <Typography
                  variant="body1"
                  fontFamily="Monospace"
                  style={{
                    fontSize: ".75rem",
                    whiteSpace: "wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {deflatedSaml ? deflatedSaml : ""}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} style={{ flex: "10 0 auto" }}>
              <Typography component="h5" variant="h5" align="left">
                Decoded SAML{" "}
                <Typography variant="body1" style={{ display: "inline-flex" }}>
                  ( utf8->utf16, inflated, base64 decoded, uri decoded)
                </Typography>
              </Typography>
              <Box
                border={1}
                borderRadius={5}
                borderColor="#576877"
                height="100%"
                width="100%"
                maxWidth="100%"
                minHeight="20vh"
                fontSize="1rem"
              >
                {decodedSaml ? (
                  <SyntaxHighlighter
                    language="xml"
                    style={docco}
                    customStyle={{ marginTop: "0" }}
                  >
                    {decodedSaml}
                  </SyntaxHighlighter>
                ) : (
                  ""
                )}
              </Box>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
}
