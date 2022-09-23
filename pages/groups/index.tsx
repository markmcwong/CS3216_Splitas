import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import BottomAppBar from "../../components/BottomAppBar";
import TopAppBar from "../../components/AppBar";
import { AppRoutesValues } from "../../utils/urls";
import { type PostBody } from "../api/user/groups";
import * as models from "../../utils/models";
import * as url from "../../utils/urls";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import ContactItem from "../../components/ContactItem";
import InputAdornment from "@mui/material/InputAdornment";
import { Add, Search } from "@mui/icons-material";
import grey from "@mui/material/colors/grey";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import MoneyLabel from "../../components/MoneyLabel";

export type GroupSummary = {
  id: number;
  name: string;
  payment: number;
  split: number;
};

export default function GroupsPage() {
  const [userWithGroups, setUserWithGroups] = useState<GroupSummary[] | null>(
    null
  );
  const [searchString, setSearchString] = useState<string>("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [balance, setBalance] = useState<number>(0);

  const fetchGroup = () => {
    fetch(`${url.api}/user/groups/summary`)
      .then((res) => res.json())
      .then((g) => {
        if (typeof g !== "string" && g.length > 0) {
          setUserWithGroups(g);
          setBalance(
            typeof g !== "string" && g.length > 0
              ? g.reduce(
                  (acc: number, curr: { payment: number; split: number }) =>
                    acc + curr.payment - curr.split,
                  0
                )
              : 0
          );
        } else {
          setUserWithGroups(null);
          setBalance(0);
        }
      });
  };

  const ModalContent = () => {
    const [name, setName] = useState<string>("");
    function submitForm(e: React.MouseEvent<HTMLElement>) {
      e.preventDefault();
      const postBody: PostBody = {
        name,
      };
      fetch(`${url.api}/user/groups`, {
        method: "POST",
        body: JSON.stringify(postBody),
      });
      setTimeout(() => {
        setName(""); // a hack to force re-render
        fetchGroup();
        handleClose();
      }, 1000);
    }

    return (
      <Modal keepMounted open={open} onClose={handleClose}>
        <Box className="modal--centered">
          <Typography variant="h6" color="primary.main">
            Create New Group
          </Typography>
          <TextField
            className="container--full-width margin__vertical--2"
            sx={{
              input: { color: "background.default" },
            }}
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="outlined"
            disabled={name.length === 0}
            type="submit"
            className="form__submit-button--full-width"
            onClick={submitForm}
          >
            Create
          </Button>
        </Box>
      </Modal>
    );
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  return (
    <>
      <Box
        bgcolor="background.paper"
        className="padding__all-3 container--min-height-maximum container--min-width-maximum"
      >
        <ModalContent />
        <BottomAppBar routeValue={AppRoutesValues.Groups} />
        <Typography variant="caption" className="text--light-grey">
          Groups Bill Balance
        </Typography>
        <Typography
          variant="h4"
          className="text--semibolded"
          color={balance < 0 ? "error.main" : "primary.main"}
        >
          ${Math.abs(balance).toFixed(2)}
        </Typography>
        <TextField
          className="container__item--full-flex container--rounded margin__top--2 text--black"
          sx={{
            input: { color: "background.default" },
          }}
          fullWidth
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
        {userWithGroups &&
          userWithGroups
            .filter((x) =>
              x.name.toLowerCase().includes(searchString.toLowerCase())
            )
            .map((group) =>
              ContactItem(
                group,
                MoneyLabel(group.payment - group.split),
                "groups"
              )
            )}
        <BottomAppBar routeValue={AppRoutesValues.Groups} />
      </Box>
      <Fab
        color="primary"
        className="fab--offset"
        aria-label="add"
        onClick={() => handleOpen()}
      >
        <AddIcon fontSize="medium" className="fab__icon--white" />
      </Fab>
    </>
  );
}
