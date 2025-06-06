import React from "react";
import renderer from "react-test-renderer";
import CreateProfile from "@/components/createProfile/CreateProfile";

test("renders correctly", () => {
  const tree = renderer.create(<CreateProfile />).toJSON();
  expect(tree).toMatchSnapshot();
});
